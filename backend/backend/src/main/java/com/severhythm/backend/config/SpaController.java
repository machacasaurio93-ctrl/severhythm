package com.severhythm.backend.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    /**
     * Redirige todas las rutas que no sean /api/ ni archivos estáticos al index.html.
     * Esto es necesario para que el enrutamiento del frontend (React) funcione
     * cuando se accede directamente a una URL como /artists o /playlists.
     */
    @RequestMapping(value = {"/", "/{path:^(?!api|assets|static|favicon).*}/**"})
    public String forward() {
        return "forward:/index.html";
    }
}
