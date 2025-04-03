-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: bubblebox2
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `amistades`
--

DROP TABLE IF EXISTS `amistades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `amistades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario1` int NOT NULL,
  `id_usuario2` int NOT NULL,
  `estado` enum('pendiente','aceptada','rechazada','bloqueado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `estado_anterior` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_friendship` (`id_usuario1`,`id_usuario2`),
  KEY `id_usuario2` (`id_usuario2`),
  CONSTRAINT `fk_amistades_usuario1` FOREIGN KEY (`id_usuario1`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_amistades_usuario2` FOREIGN KEY (`id_usuario2`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `amistades`
--

LOCK TABLES `amistades` WRITE;
/*!40000 ALTER TABLE `amistades` DISABLE KEYS */;
INSERT INTO `amistades` VALUES (2,17,1,'aceptada','2025-03-26 21:25:07','2025-03-26 21:25:25',NULL),(3,22,3,'rechazada','2025-03-29 01:59:10','2025-03-29 01:59:15',NULL),(4,3,1,'aceptada','2025-03-29 02:02:05','2025-03-29 02:02:22',NULL),(5,23,1,'aceptada','2025-04-01 17:44:42','2025-04-01 17:45:37',NULL),(6,23,3,'aceptada','2025-04-02 19:43:18','2025-04-02 19:43:25',NULL);
/*!40000 ALTER TABLE `amistades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_restores`
--

DROP TABLE IF EXISTS `backup_restores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_restores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `backup_filename` varchar(255) NOT NULL,
  `restored_at` datetime NOT NULL,
  `restored_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restored_by` (`restored_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_restores`
--

LOCK TABLES `backup_restores` WRITE;
/*!40000 ALTER TABLE `backup_restores` DISABLE KEYS */;
/*!40000 ALTER TABLE `backup_restores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backups`
--

DROP TABLE IF EXISTS `backups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backups`
--

LOCK TABLES `backups` WRITE;
/*!40000 ALTER TABLE `backups` DISABLE KEYS */;
INSERT INTO `backups` VALUES (1,'backup-2025-03-20T06-35-42-558Z.sql','2025-03-20 01:35:42',NULL),(2,'backup-2025-03-31T19-56-06-003Z.sql','2025-03-31 14:56:06',NULL),(3,'backup-2025-04-01T18-01-44-650Z.sql','2025-04-01 13:01:44',NULL);
/*!40000 ALTER TABLE `backups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_contenido` int NOT NULL,
  `tipo_contenido` enum('publicacion','reel','historia') NOT NULL,
  `contenido` text NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_id_contenido_tipo` (`id_contenido`,`tipo_contenido`),
  CONSTRAINT `fk_comentarios_contenido` FOREIGN KEY (`id_contenido`) REFERENCES `publicaciones` (`id`),
  CONSTRAINT `fk_comentarios_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios`
--

LOCK TABLES `comentarios` WRITE;
/*!40000 ALTER TABLE `comentarios` DISABLE KEYS */;
INSERT INTO `comentarios` VALUES (2,1,25,'publicacion','XD','2025-03-26 20:19:50'),(3,19,37,'publicacion','Hola','2025-03-31 20:04:14'),(4,23,39,'publicacion','....','2025-04-01 17:40:47'),(5,24,46,'publicacion','Nuevo comentario','2025-04-02 20:51:52');
/*!40000 ALTER TABLE `comentarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comunidades`
--

DROP TABLE IF EXISTS `comunidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comunidades` (
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
  KEY `fk_creador_usuario` (`id_creador`),
  CONSTRAINT `fk_comunidades_creador` FOREIGN KEY (`id_creador`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comunidades`
--

LOCK TABLES `comunidades` WRITE;
/*!40000 ALTER TABLE `comunidades` DISABLE KEYS */;
INSERT INTO `comunidades` VALUES (2,'Viajeros España','Comparte tus aventuras por España y encuentra compañeros de viaje','[]',4,NULL,NULL,'suspendido','Contenido inapropiado',7,'2025-04-09 21:03:16','2025-03-20 19:10:08'),(3,'Cocina Creativa','Espacio para compartir recetas y tips de cocina','[]',9,NULL,NULL,'publica',NULL,NULL,NULL,'2025-03-20 19:10:08'),(4,'Comunidad','Comunidad de gaticos','[\"Respetar a todos los usuarios\"]',1,'1743622834170-129568828-1742153164839-487848749-descarga (1).jfif','1743622834171-231359310-1743315325384-326183587-fondooPost.jpg','publica',NULL,NULL,NULL,'2025-04-02 14:40:34');
/*!40000 ALTER TABLE `comunidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuraciones_usuario`
--

DROP TABLE IF EXISTS `configuraciones_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuraciones_usuario` (
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuraciones_usuario`
--

LOCK TABLES `configuraciones_usuario` WRITE;
/*!40000 ALTER TABLE `configuraciones_usuario` DISABLE KEYS */;
INSERT INTO `configuraciones_usuario` VALUES (1,1,'publico',1,1,1,1,'es',1,'2025-03-26 20:16:44','2025-04-02 19:42:17');
/*!40000 ALTER TABLE `configuraciones_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historias`
--

DROP TABLE IF EXISTS `historias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `contenido` text NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fk_historias_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historias`
--

LOCK TABLES `historias` WRITE;
/*!40000 ALTER TABLE `historias` DISABLE KEYS */;
INSERT INTO `historias` VALUES (2,24,'Nueva historia','texto','2025-04-02 20:53:53','2025-04-03 20:53:53');
/*!40000 ALTER TABLE `historias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `intereses`
--

DROP TABLE IF EXISTS `intereses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `intereses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `interes` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_intereses_usuarios` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `intereses`
--

LOCK TABLES `intereses` WRITE;
/*!40000 ALTER TABLE `intereses` DISABLE KEYS */;
INSERT INTO `intereses` VALUES (11,1,'Deportes','2025-03-30 20:47:02'),(12,1,'Diseño','2025-03-30 20:47:02'),(13,1,'Filosofía','2025-03-30 20:47:02'),(14,1,'Economía','2025-03-30 20:47:02'),(15,1,'Arquitectura','2025-03-30 20:47:02'),(16,23,'Jazz','2025-04-01 17:39:37'),(17,23,'Música','2025-04-01 17:39:37'),(18,23,'Hip Hop','2025-04-01 17:39:37'),(19,23,'Filosofía','2025-04-01 17:39:37'),(20,23,'Astronomía','2025-04-01 17:39:37'),(21,24,'Pintura','2025-04-02 20:55:54'),(22,24,'Diseño','2025-04-02 20:55:54'),(23,24,'Música clásica','2025-04-02 20:55:54'),(24,24,'Música','2025-04-02 20:55:54'),(25,24,'Fitness','2025-04-02 20:55:54');
/*!40000 ALTER TABLE `intereses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,17,'Hola',NULL,'\'0:00\'',NULL,NULL,NULL,NULL,1,'2025-03-26 21:25:37'),(2,17,1,'Hola',NULL,'\'0:00\'',NULL,NULL,NULL,NULL,1,'2025-03-26 21:25:47'),(3,1,17,NULL,'/uploads/audios/1743207849536-552601800.webm','0:12',NULL,NULL,NULL,NULL,0,'2025-03-29 00:24:09'),(4,1,17,NULL,NULL,'\'0:00\'','/uploads/documents/pdf/1743211467478-680415875.pdf','usuarios_1743024690797.pdf','application',NULL,0,'2025-03-29 01:24:27'),(5,1,17,'XD',NULL,'\'0:00\'',NULL,NULL,NULL,NULL,0,'2025-03-29 01:31:19'),(8,1,23,'AA',NULL,'\'0:00\'',NULL,NULL,NULL,NULL,1,'2025-04-01 17:47:38');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (3,13,'reaccion','A Juan Andres Toro le ha gustado tu publicacion',0,NULL,'2025-03-25 05:32:13'),(4,13,'reaccion','A Juan Andres Toro le ha gustado tu publicacion',0,NULL,'2025-03-25 05:32:30'),(5,13,'reaccion','A Juan Andres Toro le ha gustado tu publicacion',0,NULL,'2025-03-25 05:32:41'),(6,13,'comentario','Juan Andres Toro ha comentado en tu publicación',0,NULL,'2025-03-26 20:19:50'),(9,17,'amistad_aceptada','Juan Andres Toro ha aceptado tu solicitud de amistad',0,2,'2025-03-26 21:25:25'),(10,17,'message','Tu amigo Juan Andres Toro te ha enviado un mensaje',0,NULL,'2025-03-26 21:25:37'),(13,17,'post','Tu amigo Juan Andres Toro ha creado una nueva publicación',0,NULL,'2025-03-26 22:05:38'),(14,17,'reaccion','A Juan Andres Toro le ha gustado tu publicacion',0,NULL,'2025-03-26 23:18:02'),(15,17,'reaccion','A Juan Andres Toro le ha gustado tu publicacion',0,NULL,'2025-03-26 23:18:04'),(16,17,'reaccion','A Juan Andres Toro le ha gustado tu publicacion',0,NULL,'2025-03-26 23:18:12'),(17,17,'reaccion','A Juan Andres Toro le ha gustado tu publicacion',0,NULL,'2025-03-29 00:22:56'),(18,17,'message','Tu amigo Juan Andres Toro te ha enviado un mensaje de audio',0,NULL,'2025-03-29 00:24:09'),(19,17,'message','Tu amigo Juan Andres Toro te ha enviado un archivo',0,NULL,'2025-03-29 01:24:27'),(20,17,'message','Tu amigo Juan Andres Toro te ha enviado un mensaje',0,NULL,'2025-03-29 01:31:19'),(22,17,'post','Tu amigo Juan Andres Toro ha creado una nueva publicación',0,NULL,'2025-03-29 01:41:45'),(25,3,'amistad_aceptada','Juan Andres Toro ha aceptado tu solicitud de amistad',0,4,'2025-03-29 02:02:22'),(26,17,'reaccion','A Juan Andres Toro le ha gustado tu publicacion',0,NULL,'2025-03-31 20:04:04'),(27,17,'reaccion','A Juan Andres Toro le ha gustado tu publicacion',0,NULL,'2025-03-31 20:04:06'),(28,1,'comentario','Juan Andres Toro ha comentado en tu publicación',0,NULL,'2025-03-31 20:04:14'),(29,1,'solicitud_amistad','Javier Montoya te ha enviado una solicitud de amistad',0,5,'2025-04-01 17:44:42'),(30,23,'amistad_aceptada','Juan Andres Toro ha aceptado tu solicitud de amistad',1,5,'2025-04-01 17:45:37'),(31,1,'message','Tu amigo Javier Montoya te ha enviado un archivo',0,NULL,'2025-04-01 17:46:54'),(32,1,'message','Tu amigo Javier Montoya te ha enviado un mensaje',0,NULL,'2025-04-01 17:47:35'),(33,23,'message','Tu amigo Juan Andres Toro te ha enviado un mensaje',0,NULL,'2025-04-01 17:47:38'),(34,17,'post','Tu amigo Juan Andres Toro ha creado una nueva publicación',0,NULL,'2025-04-02 19:21:57'),(35,3,'post','Tu amigo Juan Andres Toro ha creado una nueva publicación',0,NULL,'2025-04-02 19:21:57'),(36,23,'post','Tu amigo Juan Andres Toro ha creado una nueva publicación',0,NULL,'2025-04-02 19:21:57'),(37,23,'reaccion','A Juan Andres Toro le ha gustado tu publicacion',0,NULL,'2025-04-02 19:22:33'),(39,23,'amistad_aceptada','Mari ha aceptado tu solicitud de amistad',0,6,'2025-04-02 19:43:25');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicaciones`
--

DROP TABLE IF EXISTS `publicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `publicaciones` (
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
  KEY `id_comunidad` (`id_comunidad`),
  CONSTRAINT `fk_publicaciones_comunidad` FOREIGN KEY (`id_comunidad`) REFERENCES `comunidades` (`id`),
  CONSTRAINT `fk_publicaciones_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicaciones`
--

LOCK TABLES `publicaciones` WRITE;
/*!40000 ALTER TABLE `publicaciones` DISABLE KEYS */;
INSERT INTO `publicaciones` VALUES (24,'Hoy me levanté con antojo de tacos 🌮','¿Cuál es tu comida favorita?',13,NULL,0,NULL,'2025-03-21 00:15:31'),(25,'Mi perrito es el mejor compañero 🐶','Nada como llegar a casa y que te reciba con su amor incondicional.',13,NULL,0,NULL,'2025-03-21 00:15:31'),(26,'Día de gym 💪','Comenzando la semana con toda la energía. ¿Quién más está en modo fitness?',13,NULL,0,NULL,'2025-03-21 00:15:31'),(27,'No sé qué ponerme hoy 🤔','Días en los que el clóset está lleno pero sientes que no tienes ropa.',14,NULL,0,NULL,'2025-03-21 00:15:31'),(28,'El tráfico hoy está imposible 🚗💨','Creo que voy a necesitar una dosis extra de paciencia.',14,NULL,0,NULL,'2025-03-21 00:15:31'),(29,'¡Ya quiero que sea Navidad! 🎄','Se siente el espíritu navideño en el aire, ¿o solo soy yo?',15,NULL,0,NULL,'2025-03-21 00:15:31'),(30,'Solo paso a decir que hoy me siento increíble 🤩','Aprovecha el día al máximo, ¡haz algo que te haga feliz!',15,NULL,0,NULL,'2025-03-21 00:15:31'),(32,'Mi primera publicación','Saludos terricolas',17,NULL,0,'1743023790654-71027588-code2.png','2025-03-26 21:16:30'),(33,'488745364','<script>console.log(\'hola terricola\');</script>',17,NULL,0,'1743024027353-521764783-7e0bbae9e23c6ec40a5fad061dc066f9.jpg','2025-03-26 21:20:27'),(34,'Publicacion con espacios','     venimos en son de paz   ',17,NULL,0,'1743024205568-798579140-Imagen de WhatsApp 2025-01-18 a las 07.11.04_27d781b5.jpg','2025-03-26 21:23:25'),(37,'Hola','XD',1,NULL,0,'1743212505738-349516201-image-fotor-20250320175858.png','2025-03-29 01:41:45'),(39,'Publicacion nueva actualizada','....',23,NULL,0,'1743528935297-970117879-ec368039b38be74c0ed99d24e33a1059.jpg','2025-04-01 17:35:35'),(44,'Holaaaa','¿Como estan?',1,NULL,0,'1743621717757-850208551-1742153218520-971325835-Ã°ÂÂÂºÃ°ÂÂÂ.jfif','2025-04-02 19:21:57'),(45,NULL,'holi',1,4,1,NULL,'2025-04-02 20:42:48'),(46,'Publicacion nueva','En exposicion editada',24,NULL,0,'1743627056676-729485715-1742276951994-969822908-18.jpg','2025-04-02 20:50:56');
/*!40000 ALTER TABLE `publicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reacciones`
--

DROP TABLE IF EXISTS `reacciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reacciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) NOT NULL,
  `id_usuario` int NOT NULL,
  `id_contenido` int NOT NULL,
  `tipo_contenido` enum('publicacion','reel','historia') NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reaccion` (`id_usuario`,`id_contenido`,`tipo_contenido`),
  KEY `fk_reacciones_contenido` (`id_contenido`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reacciones`
--

LOCK TABLES `reacciones` WRITE;
/*!40000 ALTER TABLE `reacciones` DISABLE KEYS */;
INSERT INTO `reacciones` VALUES (2,'funny',1,25,'publicacion','2025-03-25 05:32:30'),(3,'angry',1,24,'publicacion','2025-03-25 05:32:41'),(4,'like',1,34,'publicacion','2025-03-26 23:18:02'),(7,'love',1,33,'publicacion','2025-03-26 23:18:12'),(8,'bored',1,32,'publicacion','2025-03-29 00:22:56'),(10,'love',19,34,'publicacion','2025-03-31 20:04:06'),(11,'love',23,39,'publicacion','2025-04-01 17:40:34'),(12,'like',23,4,'reel','2025-04-01 17:53:36'),(15,'funny',1,44,'publicacion','2025-04-02 19:28:25'),(16,'sad',24,46,'publicacion','2025-04-02 20:51:33');
/*!40000 ALTER TABLE `reacciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reels`
--

DROP TABLE IF EXISTS `reels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `archivo_video` varchar(255) NOT NULL,
  `descripcion` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reels`
--

LOCK TABLES `reels` WRITE;
/*!40000 ALTER TABLE `reels` DISABLE KEYS */;
INSERT INTO `reels` VALUES (1,2,'reel-1742920726911-445408308.mp4','prueba','2025-03-25 16:38:46'),(2,1,'reel-1742920762441-139073967.mp4','a','2025-03-25 16:39:22'),(3,1,'reel-1743205864781-740833184.mp4','XD','2025-03-28 23:51:04'),(4,1,'reel-1743205884385-652422220.mp4','XD','2025-03-28 23:51:24');
/*!40000 ALTER TABLE `reels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes`
--

DROP TABLE IF EXISTS `reportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes` (
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes`
--

LOCK TABLES `reportes` WRITE;
/*!40000 ALTER TABLE `reportes` DISABLE KEYS */;
INSERT INTO `reportes` VALUES (1,'comentario','4',23,'contenido_inapropiado','Contenido inapropiado','rechazado','2025-04-01 17:41:13',NULL,NULL,'Reporte rechazado'),(2,'comentario','5',24,'acoso','Me acosooo','pendiente','2025-04-02 20:52:08',NULL,NULL,NULL);
/*!40000 ALTER TABLE `reportes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `respuestas_comentarios_publicaciones`
--

DROP TABLE IF EXISTS `respuestas_comentarios_publicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `respuestas_comentarios_publicaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_comentario` int NOT NULL,
  `contenido` text NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_comentario` (`id_comentario`),
  KEY `fk_respuestas_comentarios_pub_usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `respuestas_comentarios_publicaciones`
--

LOCK TABLES `respuestas_comentarios_publicaciones` WRITE;
/*!40000 ALTER TABLE `respuestas_comentarios_publicaciones` DISABLE KEYS */;
INSERT INTO `respuestas_comentarios_publicaciones` VALUES (1,19,3,'...','2025-03-31 15:04:26'),(2,23,4,'XD','2025-04-01 12:40:52'),(3,24,5,'...','2025-04-02 15:51:57');
/*!40000 ALTER TABLE `respuestas_comentarios_publicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `respuestas_comentarios_reels`
--

DROP TABLE IF EXISTS `respuestas_comentarios_reels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `respuestas_comentarios_reels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_comentario` int NOT NULL,
  `contenido` text NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_comentario` (`id_comentario`),
  KEY `fk_respuestas_comentarios_reels_usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `respuestas_comentarios_reels`
--

LOCK TABLES `respuestas_comentarios_reels` WRITE;
/*!40000 ALTER TABLE `respuestas_comentarios_reels` DISABLE KEYS */;
/*!40000 ALTER TABLE `respuestas_comentarios_reels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Juan Andres Toro','Juantoro1','jtoroblandon50@gmail.com','$2a$10$v7CZBVuNdMS090Ytrzp3dOv3ruDpR9MGUpMUTx.J18lJooTimj2IC',NULL,'desconectado','2025-04-02 20:45:44',NULL,'2025-03-17 19:11:15',NULL,'fc11344d692079159a44f9e967b757158c478db20834c706d5137dbea24a4423',1743029124125,'usuario'),(2,'admin123','admin123','admin1@gmail.com','$2a$10$ABMC8Z8ETM48u.nuuckezeDj2qoTL5y7XcbV3sbz6iyeeL007nk/C',NULL,'conectado','2025-03-17 19:11:39',NULL,'2025-03-17 19:11:39',NULL,NULL,NULL,'administrador'),(3,'Mari','Mari123','mari@gmail.com','$2a$10$TrNcWHWNTWHsdtdC6fkbeu0UXRvvRwKw2IHk8BkimypsBM1rTwV2.',NULL,'desconectado','2025-04-02 19:44:13',NULL,'2025-03-19 03:00:28',NULL,NULL,NULL,'usuario'),(4,'Tito Amores','tito170','tito170@miro.com','$2a$10$4ReohBdCq8wP6rx6evEx/.KPiLiZvXywzxWahFz8yCdaf.nGDcdQa',NULL,'conectado','2025-03-21 00:10:02',NULL,'2025-03-21 00:10:02',NULL,NULL,NULL,'usuario'),(5,'Lupita Zamorano','lupita300','lupita300@segovia.org','$2a$10$cwyoHWAhoW27N3zqv1c./.UN2dMVyil7OHhuN8KBS5r96QlZa2a82',NULL,'conectado','2025-04-02 00:10:03',NULL,'2025-02-13 00:10:03',NULL,NULL,NULL,'usuario'),(6,'Moreno Pérez','moreno812','moreno812@finanzas.es','$2a$10$8N7Lhiiq8a/O/7OhmdnoBuGfaij8.bg5XmPWMgssi3bqXSzS/x.FO',NULL,'conectado','2025-04-02 00:10:04',NULL,'2025-01-02 00:10:04',NULL,NULL,NULL,'usuario'),(7,'Leopoldo Vila','leopoldo551','leopoldo551@eugenio.es','$2a$10$NzIY3lccALZMYGXWXslfKe/5VjGkk.VwvqOTuRQ3dCoozxvM4GnkW',NULL,'conectado','2025-03-21 00:10:04',NULL,'2025-02-13 00:10:04',NULL,NULL,NULL,'usuario'),(8,'Flor Sarabia','flor11','flor11@mayo.com','$2a$10$cjChK2QDUI.1WZYSw487p.1.IAR4/26T5s7pI/uxax3.aSMO0fIli',NULL,'conectado','2025-03-21 00:10:05',NULL,'2025-04-02 00:10:05',NULL,NULL,NULL,'usuario'),(9,'Arturo Roldán','arturo326','arturo326@fabrica.org','$2a$10$X3otbfV8QAXoSnQYD84aLO7owl3931ckrOdJAGvUOIi7.dglirF6S',NULL,'conectado','2025-03-21 00:10:06',NULL,'2025-03-21 00:10:06',NULL,NULL,NULL,'usuario'),(10,'Lucho Catalá','lucho580','lucho580@familia.com','$2a$10$IFlVPzZzvpyY9JXXrc727eFm0yWC6f7zSsoevbyh.RoMA3cVjvBCe',NULL,'conectado','2025-03-21 00:10:06',NULL,'2025-03-21 00:10:06',NULL,NULL,NULL,'usuario'),(11,'Buenaventura Guardiola','buenaventura899','buenaventura899@selena.com','$2a$10$cbF.stSwTyjREXmmEtFeBe9Pw9ifslE5HDfkabd3Qf.llBUWIWI8.',NULL,'conectado','2025-03-21 00:10:07',NULL,'2025-03-21 00:10:07',NULL,NULL,NULL,'usuario'),(12,'Remedios Quintero','remedios586','remedios586@sevillano.es','$2a$10$BmQ2./MZT/OoGYcLDQAP/egGvVFbBA.7IdG9GA6anHtcWmK1xCCVa',NULL,'conectado','2025-03-21 00:10:08',NULL,'2025-03-21 00:10:08',NULL,NULL,NULL,'usuario'),(13,'Micaela Durán','micaela575','micaela575@barragan.com','$2a$10$U5p87r3p/cCf5gmxZtDOGe/kL3Q4m5A7gYQ07j80dkoFlXaDUkgRa',NULL,'conectado','2025-03-21 00:15:29',NULL,'2025-03-21 00:15:29',NULL,NULL,NULL,'usuario'),(14,'Iker Colom','iker103','iker103@grupo.com','$2a$10$t0lVA4o1MNOdmr/JkmiN4.O477VbGQS0.s4OMENpUqL7rINQF5KhG',NULL,'conectado','2025-03-21 00:15:29',NULL,'2025-03-21 00:15:29',NULL,NULL,NULL,'usuario'),(15,'Rafaela Correa','rafaela625','rafaela625@maite.com','$2a$10$Vyx5LKNMwFS3WyCf2Z6T4e/BE1xuhb2mmzNLDTSoLl9b76qdKqUma',NULL,'conectado','2025-03-21 00:15:30',NULL,'2025-03-21 00:15:30',NULL,NULL,NULL,'usuario'),(16,'8546684646','4988478','16546468468@gmail.com','$2a$10$BHd0Ku3/ofeNHdQqv3/uq.h3ruDOYsUxOjduOwZ1JQDjQyvPjTTja',NULL,'desconectado','2025-03-26 21:05:30',NULL,'2025-03-26 21:05:30',NULL,NULL,NULL,'usuario'),(17,'zacarias','delri','senadeveloper.rb@gmail.com','$2a$10$9KhOWMAAlf5jp/AOG6cRP.unx8Md/FQrltn6BiY6a.cjXc4GZ/8Ze',NULL,'desconectado','2025-03-26 21:27:27',NULL,'2025-03-26 21:12:03',NULL,'7c4e6ab51bc6a5c72c49384e1a227f48e9b98cc14a96be51fc0b9525334b802c',1743028344677,'usuario'),(18,'Diana Yaneth','Diana123','blandondiana35@gmail.com','$2a$10$jydeXpT4EdwWZKrdYJYknORzPBQFZepfLD/XCA5p/ddbC.IaIwmYu',NULL,'desconectado','2025-03-26 22:00:05',NULL,'2025-03-26 22:00:05',NULL,NULL,NULL,'usuario'),(19,'Juan Andres Toro','Juantoro1','jtoroblandon@gmail.com','$2b$10$JGS8BrhKik7uneJebwFJ5O7KYTqDlZ9oXXqYe6.lIfRHFGQbchDHu',NULL,'desconectado','2025-03-31 20:04:41',NULL,'2025-03-26 22:22:53',NULL,NULL,1743454905637,'usuario'),(20,'Prueba usuario','Prueba123','prueba@gmail.com','$2a$10$mQ4bcKx30zflwbvF.7zwdegfalKVza6a9vfEW/M8cXr/WhuWn3m1m',NULL,'desconectado','2025-03-27 07:16:49',NULL,'2025-03-27 07:16:49',NULL,NULL,NULL,'usuario'),(21,'PepitaMartinez','pepita123','pepita@gmail.com','$2a$10$1nrXwzGP/6WHM5GOKVX8sehZBZZdlh5TWRGyc4BISpfANj51VJiwO',NULL,'desconectado','2025-03-27 07:24:42',NULL,'2025-03-27 07:24:42',NULL,NULL,NULL,'usuario'),(22,'Juanelc4734k','Juanelc4734k','juanelc4734k@gmail.com','$2a$10$uThVN.Ktc/Nd9yOpXhAVLOr2mjFOcLa9obD7cNmCeA7q14fdsNod2',NULL,'conectado','2025-03-29 02:02:10',NULL,'2025-03-29 01:58:55',NULL,NULL,NULL,'usuario'),(23,'Javier Montoya','Javi12345','montoya.javier@gmail.com','$2a$10$Yp3sJ5OpkY.EfXuB3wmwl.yY3Y62kkjKZqQM7YwYV471k0lOxLJju','/uploads/1743529175038-820333772-dbd6394247986c1ffba1f66682ab9582.jpg','conectado','2025-04-02 19:44:07',NULL,'2025-04-01 17:31:52',NULL,'639dd2ecec0bbe64ff9479ad9077b0973bd582b718d9bc7f84bb50a5d9211583',1743532345863,'usuario'),(24,'Mariadolores','Mariadolores4226172','mariadolores@gmail.com','$2a$10$mwJHa2T5sUrH.sHGrMyi0.rxxGXmGPGx9ZoIvrSo7.35qYOPe/WJi',NULL,'desconectado','2025-04-02 20:57:54',NULL,'2025-04-02 20:48:24',NULL,NULL,NULL,'usuario');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_comunidades`
--

DROP TABLE IF EXISTS `usuarios_comunidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_comunidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_comunidad` int NOT NULL,
  `fecha_union` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_usuario` (`id_usuario`,`id_comunidad`),
  KEY `id_comunidad` (`id_comunidad`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_comunidades`
--

LOCK TABLES `usuarios_comunidades` WRITE;
/*!40000 ALTER TABLE `usuarios_comunidades` DISABLE KEYS */;
INSERT INTO `usuarios_comunidades` VALUES (1,1,1,'2025-03-20 01:39:50'),(51,1,2,'2025-03-26 18:39:48'),(68,19,1,'2025-03-31 15:03:03'),(77,23,1,'2025-04-01 12:49:13'),(94,1,4,'2025-04-02 14:40:38');
/*!40000 ALTER TABLE `usuarios_comunidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vista_sugerencias_amigos`
--

DROP TABLE IF EXISTS `vista_sugerencias_amigos`;
/*!50001 DROP VIEW IF EXISTS `vista_sugerencias_amigos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_sugerencias_amigos` AS SELECT 
 1 AS `id`,
 1 AS `nombre`,
 1 AS `amigos_en_comun`,
 1 AS `es_amigo_de_amigo`,
 1 AS `nombres_amigos_en_comun`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `vistas_historias`
--

DROP TABLE IF EXISTS `vistas_historias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vistas_historias` (
  `historia_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `fecha_vista` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`historia_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fk_vistas_historias_historia` FOREIGN KEY (`historia_id`) REFERENCES `historias` (`id`),
  CONSTRAINT `fk_vistas_historias_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vistas_historias`
--

LOCK TABLES `vistas_historias` WRITE;
/*!40000 ALTER TABLE `vistas_historias` DISABLE KEYS */;
/*!40000 ALTER TABLE `vistas_historias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `vista_sugerencias_amigos`
--

/*!50001 DROP VIEW IF EXISTS `vista_sugerencias_amigos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_sugerencias_amigos` AS select `u`.`id` AS `id`,`u`.`nombre` AS `nombre`,count(distinct `a_comun`.`id`) AS `amigos_en_comun`,(case when (`a3`.`id` is not null) then 1 else 0 end) AS `es_amigo_de_amigo`,group_concat(distinct `u_comun`.`nombre` separator ',') AS `nombres_amigos_en_comun` from ((((`usuarios` `u` left join `amistades` `a1` on(((`u`.`id` = `a1`.`id_usuario1`) or (`u`.`id` = `a1`.`id_usuario2`)))) left join `amistades` `a_comun` on((((`a_comun`.`id_usuario1` = `u`.`id`) or (`a_comun`.`id_usuario2` = `u`.`id`)) and (`a_comun`.`estado` = 'aceptada')))) left join `usuarios` `u_comun` on((((`u_comun`.`id` = `a_comun`.`id_usuario1`) or (`u_comun`.`id` = `a_comun`.`id_usuario2`)) and (`u_comun`.`id` <> `u`.`id`)))) left join `amistades` `a3` on((((`a3`.`id_usuario1` = `u`.`id`) or (`a3`.`id_usuario2` = `u`.`id`)) and (`a3`.`estado` = 'aceptada')))) group by `u`.`id` having ((`amigos_en_comun` > 0) or (`es_amigo_de_amigo` = 1)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-02 16:03:44
