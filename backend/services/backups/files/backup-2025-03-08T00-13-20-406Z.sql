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
  KEY `id_usuario2` (`id_usuario2`)
) ENGINE=MyISAM AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `amistades`
--

LOCK TABLES `amistades` WRITE;
/*!40000 ALTER TABLE `amistades` DISABLE KEYS */;
INSERT INTO `amistades` VALUES (2,2,3,'aceptada','2024-08-18 03:09:00','2024-08-28 23:17:03',NULL),(3,3,5,'aceptada','2024-08-19 20:38:12','2025-02-20 18:59:20',NULL),(5,5,6,'aceptada','2024-08-19 20:45:57','2024-08-28 23:19:34',NULL),(6,5,2,'aceptada','2024-08-19 21:12:15','2024-08-28 23:19:34',NULL),(7,3,7,'rechazada','2024-08-19 23:12:29','2024-08-19 23:14:54',NULL),(8,2,5,'aceptada','2024-08-20 15:06:39','2024-08-20 15:06:39',NULL),(9,9,5,'aceptada','2024-08-20 15:09:00','2024-08-20 15:09:00',NULL),(10,7,2,'aceptada','2024-08-28 23:28:07','2024-08-28 23:28:07',NULL),(11,3,14,'aceptada','2025-02-20 18:58:57','2025-02-20 19:02:07',NULL),(12,14,18,'aceptada','2025-02-20 19:39:57','2025-02-20 19:40:15',NULL),(13,18,6,'pendiente','2025-02-21 00:43:53','2025-02-21 00:43:53',NULL),(14,7,14,'pendiente','2025-02-21 14:38:58','2025-02-21 14:38:58',NULL),(15,2,14,'pendiente','2025-02-22 18:46:48','2025-02-22 18:46:48',NULL),(24,6,14,'aceptada','2025-02-22 19:16:09','2025-02-22 19:16:26',NULL),(25,19,14,'aceptada','2025-02-22 20:50:26','2025-02-22 20:50:35',NULL),(26,14,11,'pendiente','2025-02-27 14:41:48','2025-02-27 14:41:48',NULL),(27,20,14,'aceptada','2025-02-27 21:17:14','2025-02-27 21:17:18',NULL),(28,22,14,'aceptada','2025-03-05 18:35:04','2025-03-05 18:35:08',NULL);
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backups`
--

LOCK TABLES `backups` WRITE;
/*!40000 ALTER TABLE `backups` DISABLE KEYS */;
INSERT INTO `backups` VALUES (2,'backup-2025-03-07T23-00-54-145Z.sql','2025-03-07 18:00:54',NULL),(3,'backup-2025-03-07T23-07-15-902Z.sql','2025-02-12 18:07:16',NULL),(4,'backup-2025-03-07T23-07-51-244Z.sql','2025-01-01 18:07:51',NULL),(5,'backup-2025-03-07T23-08-03-485Z.sql','2025-01-03 18:08:03',NULL);
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
  KEY `idx_id_contenido_tipo` (`id_contenido`,`tipo_contenido`)
) ENGINE=MyISAM AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios`
--

LOCK TABLES `comentarios` WRITE;
/*!40000 ALTER TABLE `comentarios` DISABLE KEYS */;
INSERT INTO `comentarios` VALUES (1,4,2,'publicacion','Este es un comentario de prueba','2024-08-18 17:34:02'),(2,3,2,'reel','Prueba','2024-08-18 17:38:28'),(3,2,3,'historia','prueba','2024-08-18 17:41:48'),(4,2,14,'publicacion','Hallo','2024-10-10 21:30:49'),(5,2,14,'publicacion','Hallo','2024-08-19 21:31:24'),(6,2,2,'publicacion','Comentario Prueba postman','2024-08-19 23:39:08'),(7,14,38,'publicacion','XD','2025-03-06 02:39:32'),(8,14,38,'publicacion','a','2025-03-06 02:40:40'),(9,14,38,'publicacion','arroz','2025-03-06 02:41:05'),(10,14,38,'publicacion','a','2025-03-06 02:43:02'),(11,14,38,'publicacion','XD','2025-03-06 02:44:37'),(12,14,38,'publicacion','AA','2025-03-06 02:44:40'),(13,14,38,'publicacion','XD','2025-03-06 02:51:47'),(14,14,38,'publicacion','XD','2025-03-06 02:51:50'),(15,14,38,'publicacion','XD','2025-03-06 02:53:15'),(16,14,38,'publicacion','Sera','2025-03-06 03:05:20'),(17,14,38,'publicacion','A','2025-03-06 03:07:48'),(18,14,38,'publicacion','Ahora si','2025-03-06 03:07:57'),(19,20,38,'publicacion','JAJAJAJA','2025-03-06 03:08:25'),(20,14,38,'publicacion','XD','2025-03-06 03:09:15'),(21,14,38,'publicacion','Ay dio mio','2025-03-06 03:54:56'),(22,14,38,'publicacion','Por fin dio','2025-03-06 03:55:44'),(23,14,35,'publicacion','Holaaaaa','2025-03-07 19:14:46'),(24,14,5,'reel','Holaaa','2025-03-07 19:24:27'),(25,14,40,'publicacion','Comentario nuevo','2025-03-08 00:12:41'),(26,14,40,'publicacion','XD','2025-03-08 00:12:51');
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
  `id_creador` int NOT NULL,
  `imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `tipo_privacidad` enum('publica','privada') NOT NULL DEFAULT 'publica',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_creador_usuario` (`id_creador`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comunidades`
--

LOCK TABLES `comunidades` WRITE;
/*!40000 ALTER TABLE `comunidades` DISABLE KEYS */;
INSERT INTO `comunidades` VALUES (1,'Musica ranchera','Compartan musica ranchera',2,'','publica','2024-08-19 11:00:08'),(6,'Juegos nuevos','Compartan juegos de pc',6,NULL,'privada','2025-02-26 21:16:40'),(7,'Prueba comunidad 3','Prueba creacion comunidad publica',14,'1740626177982-634120129-wp8571583-anime-2024-hd-wallpapers.jpg','publica','2025-02-26 22:16:17'),(8,'Solo leveling community','Comunidad enfocada a anime',14,'1740626219362-785777752-wp13940933-anime-2024-hd-wallpapers.jpg','privada','2025-02-26 22:16:59'),(9,'Prueba comunidad 5','Comunidad XD',14,'1741053716170-806044076-a31bc23d62b1ffbdbfb412f7881b9e9c.jpg','publica','2025-03-03 21:01:56'),(10,'Nueva comunidad','Prueba comunidad',14,NULL,'publica','2025-03-05 10:00:06');
/*!40000 ALTER TABLE `comunidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupos`
--

DROP TABLE IF EXISTS `grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_creador` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos`
--

LOCK TABLES `grupos` WRITE;
/*!40000 ALTER TABLE `grupos` DISABLE KEYS */;
INSERT INTO `grupos` VALUES (1,14,'Sotano 11','XD','1740795540082-755196709-a31bc23d62b1ffbdbfb412f7881b9e9c.jpg','2025-03-01 02:19:00');
/*!40000 ALTER TABLE `grupos` ENABLE KEYS */;
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
  KEY `usuario_id` (`usuario_id`)
) ENGINE=MyISAM AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historias`
--

LOCK TABLES `historias` WRITE;
/*!40000 ALTER TABLE `historias` DISABLE KEYS */;
/*!40000 ALTER TABLE `historias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_grupos`
--

DROP TABLE IF EXISTS `mensajes_grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_grupos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int DEFAULT NULL,
  `sender_id` int DEFAULT NULL,
  `message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `group_id` (`group_id`),
  KEY `sender_id` (`sender_id`)
) ENGINE=MyISAM AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_grupos`
--

LOCK TABLES `mensajes_grupos` WRITE;
/*!40000 ALTER TABLE `mensajes_grupos` DISABLE KEYS */;
INSERT INTO `mensajes_grupos` VALUES (83,1,20,'a','2025-03-02 01:20:51'),(82,1,20,'A','2025-03-02 01:18:06'),(81,1,20,'AAAAA','2025-03-02 01:15:58'),(80,1,20,'a','2025-03-02 01:15:47'),(79,1,14,'ae','2025-03-02 01:15:42'),(78,1,14,'a','2025-03-02 01:14:07'),(77,1,14,'XD','2025-03-02 01:13:43'),(76,1,14,'q','2025-03-02 01:12:54'),(75,1,14,'A','2025-03-02 01:12:36'),(74,1,14,'XD','2025-03-02 01:12:27'),(73,1,20,'a','2025-03-02 01:12:20'),(72,1,14,'a','2025-03-02 01:12:16'),(71,1,14,'a','2025-03-02 01:11:39'),(70,1,14,'a','2025-03-02 01:11:12'),(69,1,20,'a','2025-03-02 01:11:06'),(68,1,20,'a','2025-03-02 01:10:59'),(67,1,20,'a','2025-03-02 01:10:41'),(66,1,20,'a','2025-03-02 01:10:20'),(65,1,14,'a','2025-03-02 01:09:01'),(64,1,14,'a','2025-03-02 01:08:54'),(63,1,14,'Se','2025-03-02 01:05:20'),(62,1,14,'A','2025-03-02 01:03:07'),(61,1,14,'a','2025-03-02 01:00:30'),(60,1,20,'D','2025-03-02 00:59:44'),(59,1,14,'a','2025-03-02 00:57:22');
/*!40000 ALTER TABLE `mensajes_grupos` ENABLE KEYS */;
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
  `read_status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`)
) ENGINE=MyISAM AUTO_INCREMENT=211 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `miembros_grupos`
--

DROP TABLE IF EXISTS `miembros_grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `miembros_grupos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `group_id` (`group_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `miembros_grupos`
--

LOCK TABLES `miembros_grupos` WRITE;
/*!40000 ALTER TABLE `miembros_grupos` DISABLE KEYS */;
INSERT INTO `miembros_grupos` VALUES (1,1,14,'2025-03-01 02:19:00'),(2,1,20,'2025-03-01 02:24:39');
/*!40000 ALTER TABLE `miembros_grupos` ENABLE KEYS */;
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
  KEY `usuario_id` (`usuario_id`)
) ENGINE=MyISAM AUTO_INCREMENT=264 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (13,3,'amistad_aceptada','Juan Andres ha aceptado tu solicitud de amistad',0,NULL,'2024-08-19 20:38:49'),(12,3,'message','Tu amigo Mari te ha enviado un mensaje',0,NULL,'2024-08-19 20:32:55'),(11,3,'post','Tu amigo Mari ha creado una nueva publicación',0,NULL,'2024-08-19 20:25:16'),(10,3,'post','Tu amigo Usuario ha creado una nueva publicación',0,NULL,'2024-08-19 20:21:32'),(18,5,'comentario','Mari ha comentado en tu publicación',0,NULL,'2024-08-19 21:31:25'),(17,5,'reaccion','A Mari le ha gustado tu publicacion',0,NULL,'2024-08-19 21:24:45'),(16,2,'solicitud_amistad','Juan Andres te ha enviado una solicitud de amistad',0,NULL,'2024-08-19 21:12:15'),(19,2,'post','Tu amigo Yeni ha creado una nueva publicación',0,NULL,'2024-08-19 23:01:54'),(20,5,'post','Tu amigo Yeni ha creado una nueva publicación',0,NULL,'2024-08-19 23:01:54'),(21,7,'solicitud_amistad','Yeni te ha enviado una solicitud de amistad',0,NULL,'2024-08-19 23:12:30'),(22,3,'amistad_aceptada','Juanas ha aceptado tu solicitud de amistad',0,NULL,'2024-08-19 23:14:03'),(23,2,'message','Tu amigo Yeni te ha enviado un mensaje',0,NULL,'2024-08-20 00:05:23'),(24,3,'message','Tu amigo Juan Andres te ha enviado un mensaje',0,NULL,'2024-09-13 21:30:00'),(25,3,'message','Tu amigo Juan Andres te ha enviado un mensaje',0,NULL,'2024-09-13 21:30:09'),(26,3,'message','Tu amigo Juan Andres te ha enviado un mensaje',0,NULL,'2024-09-13 21:30:13'),(27,5,'message','Tu amigo Pepa te ha enviado un mensaje',0,NULL,'2024-09-13 21:35:41'),(28,9,'message','Tu amigo Juan Andres te ha enviado un mensaje',0,NULL,'2024-09-13 21:35:45'),(29,9,'message','Tu amigo Juan Andres te ha enviado un mensaje',0,NULL,'2024-09-13 21:41:35'),(30,5,'message','Tu amigo Pepa te ha enviado un mensaje',0,NULL,'2024-09-13 21:43:06'),(31,3,'message','Tu amigo Mari te ha enviado un mensaje',0,NULL,'2024-09-19 11:23:56'),(32,3,'message','Tu amigo Mari te ha enviado un mensaje',0,NULL,'2024-09-19 11:23:57'),(78,6,'amistad_aceptada','Juan ha aceptado tu solicitud de amistad',0,24,'2025-02-22 19:16:26'),(36,3,'amistad_aceptada','Usuario ha aceptado tu solicitud de amistad',0,NULL,'2025-02-20 18:59:20'),(37,3,'solicitud_amistad','Juan te ha enviado una solicitud de amistad',0,NULL,'2025-02-20 19:00:14'),(38,3,'amistad_aceptada','Juan ha aceptado tu solicitud de amistad',0,NULL,'2025-02-20 19:02:07'),(39,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:25:36'),(40,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:32:57'),(41,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:33:03'),(42,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:35:22'),(43,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:36:56'),(44,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:37:01'),(45,18,'solicitud_amistad','Juan te ha enviado una solicitud de amistad',0,NULL,'2025-02-20 19:39:57'),(87,3,'reaccion','A Juan le ha gustado tu publicacion',0,NULL,'2025-02-28 22:19:32'),(47,18,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:41:05'),(85,3,'reaccion','A Juan le ha gustado tu publicacion',0,NULL,'2025-02-28 22:09:02'),(49,18,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:44:22'),(51,18,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:45:49'),(53,18,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:47:52'),(54,18,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:47:54'),(55,18,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:47:54'),(56,18,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:47:54'),(57,18,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:47:54'),(58,18,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:47:55'),(59,18,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:50:29'),(60,18,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-02-20 19:50:40'),(62,6,'solicitud_amistad','PruebaChats te ha enviado una solicitud de amistad',0,NULL,'2025-02-21 00:43:53'),(81,11,'solicitud_amistad','Juan te ha enviado una solicitud de amistad',0,26,'2025-02-27 14:41:48'),(73,5,'amistad_aceptada','Juan ha aceptado tu solicitud de amistad',0,21,'2025-02-22 19:09:05'),(65,6,'solicitud_amistad','Juan te ha enviado una solicitud de amistad',0,NULL,'2025-02-22 18:48:48'),(75,5,'amistad_aceptada','Juan ha aceptado tu solicitud de amistad',0,22,'2025-02-22 19:10:21'),(80,19,'amistad_aceptada','Juan ha aceptado tu solicitud de amistad',0,25,'2025-02-22 20:50:35'),(70,5,'amistad_aceptada','Juan ha aceptado tu solicitud de amistad',0,NULL,'2025-02-22 19:02:51'),(71,5,'amistad_aceptada','Juan ha aceptado tu solicitud de amistad',0,20,'2025-02-22 19:08:29'),(88,3,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-02-28 23:44:30'),(93,3,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-02-28 23:49:32'),(90,6,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-02-28 23:44:30'),(91,19,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-02-28 23:44:30'),(103,3,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-01 00:16:21'),(95,6,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-02-28 23:49:32'),(96,19,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-02-28 23:49:32'),(98,3,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-02-28 23:50:59'),(123,3,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-03 19:30:54'),(120,6,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-03 19:25:13'),(100,6,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-02-28 23:50:59'),(101,19,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-02-28 23:50:59'),(138,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-03-04 00:07:38'),(118,3,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-03 19:25:13'),(105,6,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-01 00:16:21'),(106,19,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-01 00:16:21'),(164,22,'amistad_aceptada','Juan ha aceptado tu solicitud de amistad',0,28,'2025-03-05 18:35:08'),(152,18,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-05 14:56:20'),(121,19,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-03 19:25:13'),(151,3,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-05 14:56:20'),(125,6,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-03 19:30:54'),(126,19,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-03 19:30:54'),(128,3,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-03 19:33:46'),(130,6,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-03 19:33:46'),(131,19,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-03 19:33:46'),(143,3,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-04 02:00:48'),(144,18,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-04 02:00:48'),(145,6,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-04 02:00:48'),(146,19,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-04 02:00:48'),(254,20,'message','Tu amigo Juan te ha enviado un mensaje de audio',0,NULL,'2025-03-06 11:45:20'),(253,14,'respuesta_comentario','Pepito ha respondido a tu comentario',0,NULL,'2025-03-06 03:55:53'),(153,6,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-05 14:56:21'),(154,19,'post','Tu amigo Juan ha creado una nueva publicación',0,NULL,'2025-03-05 14:56:21'),(208,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-03-06 01:10:36'),(209,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-03-06 01:10:57'),(210,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-03-06 01:11:05'),(211,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-03-06 01:17:37'),(212,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-03-06 01:17:42'),(213,3,'message','Tu amigo Juan te ha enviado un mensaje',0,NULL,'2025-03-06 01:23:08'),(255,17,'sistema','Advertencia de contenido',0,NULL,'2025-03-07 19:32:14'),(256,17,'sistema','Advertencia de contenido',0,NULL,'2025-03-07 19:33:27'),(257,17,'sistema','Advertencia de contenido',0,NULL,'2025-03-07 19:34:23'),(261,14,'post','Tu amigo Pepito ha creado una nueva publicación',0,NULL,'2025-03-07 20:58:23'),(262,20,'comentario','Juan ha comentado en tu publicación',0,NULL,'2025-03-08 00:12:41'),(263,20,'comentario','Juan ha comentado en tu publicación',0,NULL,'2025-03-08 00:12:51'),(247,20,'comentario','Juan ha comentado en tu publicación',0,NULL,'2025-03-06 03:09:15');
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
  `titulo` varchar(255) NOT NULL,
  `contenido` text NOT NULL,
  `id_usuario` int NOT NULL,
  `id_comunidad` int DEFAULT NULL,
  `es_comunidad` tinyint(1) NOT NULL DEFAULT '0',
  `imagen` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_comunidad` (`id_comunidad`)
) ENGINE=MyISAM AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicaciones`
--

LOCK TABLES `publicaciones` WRITE;
/*!40000 ALTER TABLE `publicaciones` DISABLE KEYS */;
INSERT INTO `publicaciones` VALUES (6,'Prueba publicacion comunidad','Contenido del post',2,1,1,NULL,'2024-08-19 16:10:32'),(15,'Prueba publicacion','Hola',3,NULL,0,'','2024-08-19 23:01:53'),(14,'prueba notificacion','XD error del carajo',5,NULL,0,NULL,'2024-08-19 21:23:53'),(13,'Prueba publicacion con notificacion','Holas definitiva',2,NULL,0,NULL,'2024-08-19 20:25:16'),(16,'Prueba publicacion 2 comunidad','Holas',3,1,1,NULL,'2024-08-19 23:57:20'),(23,'Hola','Prueba antepenultima',14,NULL,0,'1738009106069-52739631-dbd6394247986c1ffba1f66682ab9582.jpg','2025-01-27 20:18:26'),(27,'Tokio la ciudad iluminada','Luces, rascacielos y energía sin fin: bienvenido a Tokio. 🌆🇯🇵',14,NULL,0,'1740786572876-483281193-29e5d824859b399c33bb44b400b63b62.jpg','2025-02-28 23:49:32'),(24,'Hola','Ultima prueba',14,NULL,0,'1738009200829-358555184-dbd6394247986c1ffba1f66682ab9582.jpg','2025-01-27 20:20:00'),(25,'jhwefhwgfw','fkhwgfhwygwfgtfwgw',14,NULL,0,NULL,'2025-02-03 18:35:20'),(26,'Mejor país del mundo','Japón, donde la tradición y la modernidad se encuentran en perfecta armonía. 🇯🇵✨',14,NULL,0,'1740786270729-290716952-a31bc23d62b1ffbdbfb412f7881b9e9c.jpg','2025-02-28 23:44:30'),(28,'Tokio la ciudad iluminada 2','Tokio una de las ciudades mas...',14,NULL,0,'1740786659362-321109222-imagen_2025-02-28_185044642.png','2025-02-28 23:50:59'),(29,'Cultura y tecnología 🎌🏙️','Desde templos antiguos hasta rascacielos futuristas, Tokio es una ciudad donde el pasado y el futuro coexisten de manera única.',14,NULL,0,'1740788181648-694565248-imagen_2025-02-28_191620140.png','2025-03-01 00:16:21'),(33,'El voleibol mi pasión','El voleibol no es solo un deporte, es mi pasión, mi energía y mi forma de vida. 🏐🔥',14,NULL,0,'1741029913684-637608832-imagen_2025-03-03_142512360.png','2025-03-03 19:25:13'),(34,'El arte de rematar','La precisión, la fuerza y la pasión se unen en cada remate. 🏐⚡',14,NULL,0,'1741030254203-442924187-imagen_2025-03-03_143029881.png','2025-03-03 19:30:54'),(35,'Ser central es lo mejor del mundo','\"Dominando la red, bloqueando y atacando. Ser central es una pasión inigualable. 🏐💪🔥',14,NULL,0,'1741030426517-73660821-imagen_2025-03-03_143330873.png','2025-03-03 19:33:46'),(37,'Mejor deporte del mundo','El voleibol se ha coronado como el ....',20,NULL,0,'1741092833893-232086672-imagen_2025-03-04_075334513.png','2025-03-04 12:53:53'),(38,'XD','Otra prueba para ver el dashboard',20,NULL,0,'1741093393048-8716448-Diagrama microservicios.png','2025-03-04 13:03:13'),(40,'Mejor país del mundo','Publciacion random',20,NULL,0,'1741381103049-415858247-wp8571583-anime-2024-hd-wallpapers.jpg','2025-03-07 20:58:23');
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
  UNIQUE KEY `unique_reaccion` (`id_usuario`,`id_contenido`,`tipo_contenido`)
) ENGINE=MyISAM AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reacciones`
--

LOCK TABLES `reacciones` WRITE;
/*!40000 ALTER TABLE `reacciones` DISABLE KEYS */;
INSERT INTO `reacciones` VALUES (82,'amazing',14,29,'publicacion','2025-03-03 23:45:41'),(74,'love',20,29,'publicacion','2025-03-01 01:26:26'),(20,'like',14,16,'publicacion','2025-02-28 22:19:32'),(25,'like',14,4,'reel','2025-02-28 22:51:03'),(78,'like',14,30,'publicacion','2025-03-03 17:51:30'),(79,'like',20,31,'publicacion','2025-03-03 18:59:38'),(83,'love',14,35,'publicacion','2025-03-04 00:35:10'),(81,'amazing',14,34,'publicacion','2025-03-03 19:34:09'),(84,'love',14,37,'publicacion','2025-03-04 19:23:19'),(85,'funny',14,39,'publicacion','2025-03-05 14:56:40'),(86,'sad',20,38,'publicacion','2025-03-06 03:57:13'),(87,'like',14,7,'reel','2025-03-07 19:22:23');
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
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reels`
--

LOCK TABLES `reels` WRITE;
/*!40000 ALTER TABLE `reels` DISABLE KEYS */;
INSERT INTO `reels` VALUES (3,2,'reel-1740444277329-687571442.mp4','Holaaa','2024-08-19 23:19:52'),(5,14,'reel-1740446601337-498568310.mp4','JAJAJAJAJJAJA X2','2025-02-25 01:23:21'),(6,14,'reel-1741122287188-235484551.mp4','Reel N2','2025-03-04 21:04:47'),(7,14,'reel-1741122564588-880385773.mp4','Reel N3','2025-03-04 21:09:24'),(8,14,'reel-1741382617962-775661781.mp4','Reel N4','2025-03-07 21:23:37');
/*!40000 ALTER TABLE `reels` ENABLE KEYS */;
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
  KEY `id_comentario` (`id_comentario`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `respuestas_comentarios_publicaciones`
--

LOCK TABLES `respuestas_comentarios_publicaciones` WRITE;
/*!40000 ALTER TABLE `respuestas_comentarios_publicaciones` DISABLE KEYS */;
INSERT INTO `respuestas_comentarios_publicaciones` VALUES (1,14,20,'XD','2025-03-05 22:33:12'),(2,14,20,'XD','2025-03-05 22:33:44'),(3,14,20,'A','2025-03-05 22:35:07'),(4,14,19,'No mames XD','2025-03-05 22:38:57'),(5,14,20,'WTF','2025-03-05 22:39:33'),(6,20,20,'JAJAJAJJAA','2025-03-05 22:42:57'),(7,20,21,'XDDDD','2025-03-05 22:55:07'),(8,20,22,'SIIII','2025-03-05 22:55:53');
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
  KEY `id_comentario` (`id_comentario`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `estado` enum('conectado','desconectado','suspendido') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'desconectado',
  `lastSeen` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `descripcion_usuario` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `secret2FA` varchar(255) DEFAULT NULL,
  `token_recuperacion` varchar(255) DEFAULT NULL,
  `token_expiracion` bigint DEFAULT NULL,
  `rol` enum('usuario','moderador','administrador') DEFAULT 'usuario',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (6,'Pepito','Pepito123','pepito@gmail.com','$2b$10$NQTpWFUwJ/xYqXGGy53DmeVIqY3pwrEfBGlkmRt3YP1yvXvXreI.6',NULL,'desconectado','2025-03-03 22:04:45',NULL,'2024-08-19 20:42:54',NULL,NULL,NULL,'usuario'),(2,'Mari','Mari123','mari@gmail.com','$2a$10$kqgZcWvTU19vGM7AWUm6luDKFC5pUQjhkLfp.iI97/mLqq1S3Dyaa',NULL,'conectado','2025-03-03 22:04:45',NULL,'2024-08-16 23:07:23',NULL,NULL,NULL,'usuario'),(3,'Yeni','Yeni123','yeni@gmail.com','Yeni123',NULL,'desconectado','2025-03-03 22:04:45',NULL,'2024-08-17 16:39:21',NULL,NULL,NULL,'usuario'),(14,'Juan','Juan123','jtoroblandon@gmail.com','$2a$10$oszgF8wnaQSOlvtEsagYduJMBLVOSC5dautbIYY6CuaP9PgbOyBHK','/uploads/1740066025108-319783766-dbd6394247986c1ffba1f66682ab9582.jpg','conectado','2025-03-07 20:53:14',NULL,'2024-09-19 10:11:42',NULL,'cf31bdbe87a9d52a1096e1c8fd368fefd2bc62969a377d8eacc7f0403b01b828',1740510316055,'usuario'),(9,'Pepa','pepa123','pepa@gmail.com','$2a$10$97M7PtQNpzxASuBlJtWn3OTwjPdy5k.9nRXPYLFc24XLliVa6Pl6u',NULL,'conectado','2025-03-03 22:04:45',NULL,'2024-08-20 15:07:58',NULL,NULL,NULL,'usuario'),(10,'Juan Andres Toro','JuanT12345','juanelc4734k@gmail.com','$2b$10$hHDIB1dngJsNTW8Yvnc4XOTFUW6LefsSLOFiONINjmgF0ckzgtFIK',NULL,'desconectado','2025-03-03 22:04:45',NULL,'2024-08-25 02:56:01',NULL,NULL,NULL,'usuario'),(11,'Pepa','pepa123','pepa12@gmail.com','$2b$10$OQnTjSye4/DGHaZbCaguVeFmUrnCS8wrkzIMI8whPb/BPIsmosxuO',NULL,'conectado','2025-03-03 22:04:45',NULL,'2024-08-25 03:17:28',NULL,NULL,NULL,'usuario'),(12,'Usuario Prueba','usuario_prueba','usuario@prueba.com','$2a$10$OXG7JbntGHf/O25gSd0S8uUOOmISDcJ9YN9GOZ6vy/wK48Dw//NXO',NULL,'conectado','2025-03-03 22:04:45',NULL,'2024-08-27 22:28:52','KQ2CKNJQKRHXOVCWORVVWUC6NFFXM5CCEFEFIZTEPBLUS4DNI5XQ',NULL,NULL,'usuario'),(13,'admin','admin123','admin@gmail.com','$2a$12$rp41i7X0il5EVqwj6OieyeW6U5nSYyqkEGgOOKsfWwv9gdQZzaCvK',NULL,'conectado','2025-03-03 22:04:45',NULL,'2024-09-04 20:24:41',NULL,NULL,NULL,'administrador'),(15,'Prueba2','Prueba2','prueba2@gmail.com','$2a$10$GuSU4YVX8kZ7FX0RUwiMaeyB2nAXppGF592KGJR/CZ3maqR6K5iWe',NULL,'conectado','2025-03-03 22:04:45',NULL,'2025-02-10 18:33:37',NULL,NULL,NULL,'usuario'),(16,'Prueba2','Prueba2','prueba2022@gmail.com','$2a$10$JhqpGAmnmmav7k1XWW9TS./7QSeFPURIviISmIrAVwPkwhx5EqSk.',NULL,'desconectado','2025-03-03 22:04:45',NULL,'2025-02-10 18:34:04',NULL,NULL,NULL,'usuario'),(17,'Administrador','admin1','admin1@gmail.com','$2a$10$EV4vmrBhPve/6kKT9sitqullBpkztEgcFrQRgyztLJ68vBxvHYzOu',NULL,'conectado','2025-03-04 01:58:33',NULL,'2025-02-17 23:35:50',NULL,NULL,NULL,'administrador'),(18,'PruebaChats','PruebaChats2','pruebachats2@gmail.com','$2a$10$42YzIVln3//WE0hquplkH.9vTux92rPIofTYK39A4jgyw2vgHC01i','/uploads/1740096998867-567713841-7e0bbae9e23c6ec40a5fad061dc066f9.jpg','desconectado','2025-03-03 22:04:45','Me encanta el mar, el voleibol, la musica entre otras muchas cosas 😍','2025-02-20 19:39:03',NULL,NULL,NULL,'usuario'),(19,'Yeni','Yeni1234567890','yeni123@gmail.com','$2a$10$smvZEUD2FtwtfU.WY6pJbOS6oMvSet8ik7Y5GG8mbokYoYQG.JfmO',NULL,'conectado','2025-03-03 22:04:45',NULL,'2025-02-22 20:50:03',NULL,NULL,NULL,'usuario'),(20,'Pepito','PepitoPerez123','juanelc4724k@gmail.com','$2a$10$gSf3B6sHtipM4fJE6DXPZ.4btdWBylXHWPZThVTxLjOS.jQGyQk9a','/uploads/1741024527254-735789885-imagen_2025-03-03_125527192.png','desconectado','2025-03-07 21:08:03','Soy nuevo en BubbleBox y estoy muy emocionado por conectar con nuevos amigos.','2025-02-27 21:16:43',NULL,NULL,NULL,'usuario'),(21,'Mariii','Mariii2025','mari2025@gmail.com','mari2025',NULL,'desconectado','2025-03-04 14:48:17','XD','2025-01-01 14:46:42',NULL,NULL,NULL,'usuario');
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
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_comunidades`
--

LOCK TABLES `usuarios_comunidades` WRITE;
/*!40000 ALTER TABLE `usuarios_comunidades` DISABLE KEYS */;
INSERT INTO `usuarios_comunidades` VALUES (7,14,7,'2025-02-26 22:16:29'),(13,14,8,'2025-02-26 22:28:55'),(14,14,5,'2025-02-26 22:29:09'),(15,14,6,'2025-03-05 14:35:25');
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
  KEY `usuario_id` (`usuario_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vistas_historias`
--

LOCK TABLES `vistas_historias` WRITE;
/*!40000 ALTER TABLE `vistas_historias` DISABLE KEYS */;
INSERT INTO `vistas_historias` VALUES (1,3,'2024-08-18 16:53:19'),(4,2,'2024-08-19 23:34:45'),(22,14,'2025-03-06 23:44:29'),(23,14,'2025-03-06 23:50:56'),(24,20,'2025-03-06 23:59:53');
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

-- Dump completed on 2025-03-07 19:13:20
