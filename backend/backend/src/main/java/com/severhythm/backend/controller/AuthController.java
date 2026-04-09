package com.severhythm.backend.controller;

import com.severhythm.backend.model.User;
import com.severhythm.backend.repository.UserRepository;
import com.severhythm.backend.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    // Datos que llegan del formulario de registro
    public static class RegisterRequest {
        @NotBlank public String username;
        @NotBlank public String email;
        @NotBlank public String password;
        public String displayName;
    }

    // Datos que llegan del formulario de login
    public static class LoginRequest {
        @NotBlank public String username;
        @NotBlank public String password;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest req) {
        // Validar duplicados
        if (userRepo.existsByUsername(req.username)) {
            return error(HttpStatus.CONFLICT, "El nombre de usuario ya existe");
        }
        if (userRepo.existsByEmail(req.email)) {
            return error(HttpStatus.CONFLICT, "El email ya está registrado");
        }

        // Crear usuario
        User user = new User();
        user.setUsername(req.username);
        user.setEmail(req.email);
        user.setPassword(passwordEncoder.encode(req.password));
        user.setDisplayName(req.displayName != null ? req.displayName : req.username);
        user = userRepo.save(user);

        // Generamos el token JWT
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED).body(buildAuthResponse(user, token));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepo.findByUsername(req.username).orElse(null);
        if (user == null || !passwordEncoder.matches(req.password, user.getPassword())) {
            return error(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        return ResponseEntity.ok(buildAuthResponse(user, token));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@RequestHeader("Authorization") String authHeader) {
        // Sacamos el userId del token que ya validó el filtro
        String token = authHeader.substring(7);
        String userId = jwtUtil.getUserIdFromToken(token);
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return error(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("displayName", user.getDisplayName());
        response.put("avatarUrl", user.getAvatarUrl());
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildAuthResponse(User user, String token) {
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail(),
            "displayName", user.getDisplayName() != null ? user.getDisplayName() : user.getUsername()
        ));
        return response;
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }
}
