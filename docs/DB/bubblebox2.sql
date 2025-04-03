-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 03-04-2025 a las 19:29:03
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bubblebox2`
--
CREATE DATABASE IF NOT EXISTS `bubblebox2` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `bubblebox2`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `amistades`
--

DROP TABLE IF EXISTS `amistades`;
CREATE TABLE IF NOT EXISTS `amistades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario1` int NOT NULL,
  `id_usuario2` int NOT NULL,
  `estado` enum('pendiente','aceptada','rechazada','bloqueado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `estado_anterior` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_friendship` (`id_usuario1`,`id_usuario2`),
  KEY `id_usuario2` (`id_usuario2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `backups`
--

DROP TABLE IF EXISTS `backups`;
CREATE TABLE IF NOT EXISTS `backups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `backup_restores`
--

DROP TABLE IF EXISTS `backup_restores`;
CREATE TABLE IF NOT EXISTS `backup_restores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `backup_filename` varchar(255) NOT NULL,
  `restored_at` datetime NOT NULL,
  `restored_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restored_by` (`restored_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
CREATE TABLE IF NOT EXISTS `comentarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_contenido` int NOT NULL,
  `tipo_contenido` enum('publicacion','reel','historia') NOT NULL,
  `contenido` text NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_id_contenido_tipo` (`id_contenido`,`tipo_contenido`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comunidades`
--

DROP TABLE IF EXISTS `comunidades`;
CREATE TABLE IF NOT EXISTS `comunidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `reglas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `id_creador` int NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `tipo_privacidad` enum('publica','privada','suspendido') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'publica',
  `motivo` varchar(255) DEFAULT NULL,
  `duracion` int DEFAULT NULL,
  `fecha_fin_suspension` timestamp NULL DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_creador_usuario` (`id_creador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuraciones_usuario`
--

DROP TABLE IF EXISTS `configuraciones_usuario`;
CREATE TABLE IF NOT EXISTS `configuraciones_usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `privacidad` varchar(20) DEFAULT 'publico',
  `notificaciones` tinyint(1) DEFAULT '1',
  `audio_enabled` tinyint(1) DEFAULT '1',
  `files_access_enabled` tinyint(1) DEFAULT '1',
  `online_visibility` tinyint(1) DEFAULT '1',
  `idioma` varchar(5) DEFAULT 'es',
  `autoplay_videos` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_configuraciones_usuario_id` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historias`
--

DROP TABLE IF EXISTS `historias`;
CREATE TABLE IF NOT EXISTS `historias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `contenido` text NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `intereses`
--

DROP TABLE IF EXISTS `intereses`;
CREATE TABLE IF NOT EXISTS `intereses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `interes` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_intereses_usuarios` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int DEFAULT NULL,
  `receiver_id` int DEFAULT NULL,
  `message` text,
  `audio_path` varchar(255) DEFAULT NULL,
  `duration` varchar(10) DEFAULT '''0:00''',
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `file_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `read_status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `contenido` text NOT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `referencia_id` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `fk_notificaciones_referencia` (`referencia_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicaciones`
--

DROP TABLE IF EXISTS `publicaciones`;
CREATE TABLE IF NOT EXISTS `publicaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `contenido` text NOT NULL,
  `id_usuario` int NOT NULL,
  `id_comunidad` int DEFAULT NULL,
  `es_comunidad` tinyint(1) NOT NULL DEFAULT '0',
  `imagen` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_comunidad` (`id_comunidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reacciones`
--

DROP TABLE IF EXISTS `reacciones`;
CREATE TABLE IF NOT EXISTS `reacciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) NOT NULL,
  `id_usuario` int NOT NULL,
  `id_contenido` int NOT NULL,
  `tipo_contenido` enum('publicacion','reel','historia') NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reaccion` (`id_usuario`,`id_contenido`,`tipo_contenido`),
  KEY `fk_reacciones_contenido` (`id_contenido`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reels`
--

DROP TABLE IF EXISTS `reels`;
CREATE TABLE IF NOT EXISTS `reels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `archivo_video` varchar(255) NOT NULL,
  `descripcion` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

DROP TABLE IF EXISTS `reportes`;
CREATE TABLE IF NOT EXISTS `reportes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_reporte` enum('publicacion','reel','comentario','comunidad','usuario','contenido') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_contenido` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario_reportante` int NOT NULL,
  `motivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estado` enum('pendiente','revisado','resuelto','rechazado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `fecha_reporte` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_resolucion` timestamp NULL DEFAULT NULL,
  `id_admin_resolucion` int DEFAULT NULL,
  `accion_tomada` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tipo_reporte` (`tipo_reporte`),
  KEY `id_contenido` (`id_contenido`),
  KEY `id_usuario_reportante` (`id_usuario_reportante`),
  KEY `estado` (`estado`),
  KEY `fecha_reporte` (`fecha_reporte`),
  KEY `fk_reportes_admin_resolucion` (`id_admin_resolucion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `respuestas_comentarios_publicaciones`
--

DROP TABLE IF EXISTS `respuestas_comentarios_publicaciones`;
CREATE TABLE IF NOT EXISTS `respuestas_comentarios_publicaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_comentario` int NOT NULL,
  `contenido` text NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_comentario` (`id_comentario`),
  KEY `fk_respuestas_comentarios_pub_usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `respuestas_comentarios_reels`
--

DROP TABLE IF EXISTS `respuestas_comentarios_reels`;
CREATE TABLE IF NOT EXISTS `respuestas_comentarios_reels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_comentario` int NOT NULL,
  `contenido` text NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_comentario` (`id_comentario`),
  KEY `fk_respuestas_comentarios_reels_usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(250) NOT NULL,
  `username` varchar(250) NOT NULL,
  `email` varchar(250) NOT NULL,
  `contraseña` varchar(250) NOT NULL,
  `avatar` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `estado` enum('conectado','desconectado','suspendido','invisible') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'desconectado',
  `lastSeen` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `descripcion_usuario` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `secret2FA` varchar(255) DEFAULT NULL,
  `token_recuperacion` varchar(255) DEFAULT NULL,
  `token_expiracion` bigint DEFAULT NULL,
  `rol` enum('usuario','moderador','administrador') DEFAULT 'usuario',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_comunidades`
--

DROP TABLE IF EXISTS `usuarios_comunidades`;
CREATE TABLE IF NOT EXISTS `usuarios_comunidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_comunidad` int NOT NULL,
  `fecha_union` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_usuario` (`id_usuario`,`id_comunidad`),
  KEY `id_comunidad` (`id_comunidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vistas_historias`
--

DROP TABLE IF EXISTS `vistas_historias`;
CREATE TABLE IF NOT EXISTS `vistas_historias` (
  `historia_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `fecha_vista` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`historia_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_sugerencias_amigos`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `vista_sugerencias_amigos`;
CREATE TABLE IF NOT EXISTS `vista_sugerencias_amigos` (
`amigos_en_comun` bigint
,`es_amigo_de_amigo` int
,`id` int
,`nombre` varchar(250)
,`nombres_amigos_en_comun` text
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_sugerencias_amigos`
--
DROP TABLE IF EXISTS `vista_sugerencias_amigos`;

DROP VIEW IF EXISTS `vista_sugerencias_amigos`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_sugerencias_amigos`  AS SELECT `u`.`id` AS `id`, `u`.`nombre` AS `nombre`, count(distinct `a_comun`.`id`) AS `amigos_en_comun`, (case when (`a3`.`id` is not null) then 1 else 0 end) AS `es_amigo_de_amigo`, group_concat(distinct `u_comun`.`nombre` separator ',') AS `nombres_amigos_en_comun` FROM ((((`usuarios` `u` left join `amistades` `a1` on(((`u`.`id` = `a1`.`id_usuario1`) or (`u`.`id` = `a1`.`id_usuario2`)))) left join `amistades` `a_comun` on((((`a_comun`.`id_usuario1` = `u`.`id`) or (`a_comun`.`id_usuario2` = `u`.`id`)) and (`a_comun`.`estado` = 'aceptada')))) left join `usuarios` `u_comun` on((((`u_comun`.`id` = `a_comun`.`id_usuario1`) or (`u_comun`.`id` = `a_comun`.`id_usuario2`)) and (`u_comun`.`id` <> `u`.`id`)))) left join `amistades` `a3` on((((`a3`.`id_usuario1` = `u`.`id`) or (`a3`.`id_usuario2` = `u`.`id`)) and (`a3`.`estado` = 'aceptada')))) GROUP BY `u`.`id` HAVING ((`amigos_en_comun` > 0) OR (`es_amigo_de_amigo` = 1)) ;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `amistades`
--
ALTER TABLE `amistades`
  ADD CONSTRAINT `fk_amistades_usuario1` FOREIGN KEY (`id_usuario1`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `fk_amistades_usuario2` FOREIGN KEY (`id_usuario2`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `comentarios`
--
ALTER TABLE `comentarios`
  ADD CONSTRAINT `fk_comentarios_contenido` FOREIGN KEY (`id_contenido`) REFERENCES `publicaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_comentarios_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `comunidades`
--
ALTER TABLE `comunidades`
  ADD CONSTRAINT `fk_comunidades_creador` FOREIGN KEY (`id_creador`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `historias`
--
ALTER TABLE `historias`
  ADD CONSTRAINT `fk_historias_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  ADD CONSTRAINT `fk_publicaciones_comunidad` FOREIGN KEY (`id_comunidad`) REFERENCES `comunidades` (`id`),
  ADD CONSTRAINT `fk_publicaciones_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `vistas_historias`
--
ALTER TABLE `vistas_historias`
  ADD CONSTRAINT `fk_vistas_historias_historia` FOREIGN KEY (`historia_id`) REFERENCES `historias` (`id`),
  ADD CONSTRAINT `fk_vistas_historias_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

DELIMITER $$
--
-- Eventos
--
DROP EVENT IF EXISTS `eliminar_historias_expiradas`$$
CREATE DEFINER=`root`@`localhost` EVENT `eliminar_historias_expiradas` ON SCHEDULE EVERY 10 MINUTE STARTS '2025-02-27 15:44:29' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    DELETE FROM reacciones 
    WHERE tipo_contenido = 'historia' 
    AND id_contenido IN (SELECT id FROM historias WHERE fecha_expiracion < NOW());

    DELETE FROM historias WHERE fecha_expiracion < NOW();
END$$

DROP EVENT IF EXISTS `restaurar_privacidad`$$
CREATE DEFINER=`root`@`localhost` EVENT `restaurar_privacidad` ON SCHEDULE EVERY 1 HOUR STARTS '2025-03-08 13:14:39' ON COMPLETION NOT PRESERVE ENABLE DO UPDATE comunidades 
SET tipo_privacidad = 'publica', 
    fecha_fin_suspension = NULL,
    motivo = NULL,
    duracion = NULL
WHERE tipo_privacidad = 'suspendido' 
  AND fecha_fin_suspension <= NOW()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
