/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.2.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: cytube3
-- ------------------------------------------------------
-- Server version	12.2.2-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `aliases`
--

USE cytube3;

DROP TABLE IF EXISTS `aliases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aliases` (
  `visit_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ip` varchar(39) NOT NULL,
  `name` varchar(20) NOT NULL,
  `time` bigint(20) NOT NULL,
  PRIMARY KEY (`visit_id`),
  KEY `aliases_ip_index` (`ip`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aliases`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `aliases` WRITE;
/*!40000 ALTER TABLE `aliases` DISABLE KEYS */;
INSERT INTO `aliases` VALUES
(2,'192.168.32.1','test',1772057872791);
/*!40000 ALTER TABLE `aliases` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `banned_channels`
--

DROP TABLE IF EXISTS `banned_channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `banned_channels` (
  `channel_name` varchar(30) NOT NULL,
  `external_reason` text NOT NULL,
  `internal_reason` text NOT NULL,
  `banned_by` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  UNIQUE KEY `banned_channels_channel_name_unique` (`channel_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banned_channels`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `banned_channels` WRITE;
/*!40000 ALTER TABLE `banned_channels` DISABLE KEYS */;
/*!40000 ALTER TABLE `banned_channels` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `channel_bans`
--

DROP TABLE IF EXISTS `channel_bans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `channel_bans` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ip` varchar(39) NOT NULL,
  `name` varchar(20) NOT NULL,
  `bannedby` varchar(20) NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `channel` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `channel_bans_name_ip_channel_unique` (`name`,`ip`,`channel`),
  KEY `channel_bans_ip_channel_index` (`ip`,`channel`),
  KEY `channel_bans_name_channel_index` (`name`,`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channel_bans`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `channel_bans` WRITE;
/*!40000 ALTER TABLE `channel_bans` DISABLE KEYS */;
/*!40000 ALTER TABLE `channel_bans` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `channel_data`
--

DROP TABLE IF EXISTS `channel_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `channel_data` (
  `channel_id` int(10) unsigned NOT NULL,
  `key` varchar(20) NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  PRIMARY KEY (`channel_id`,`key`),
  CONSTRAINT `channel_data_channel_id_foreign` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channel_data`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `channel_data` WRITE;
/*!40000 ALTER TABLE `channel_data` DISABLE KEYS */;
INSERT INTO `channel_data` VALUES
(1,'chatbuffer','[{\"username\":\"test\",\"msg\":\"test\",\"meta\":{\"coolholeMeta\":{\"otherClasses\":[],\"deny\":false}},\"time\":1772057817065}]'),
(1,'chatmuted','[]'),
(1,'coolpoints','[{\"user\":\"test\",\"points\":36}]'),
(1,'coolpointsActions','[{\"name\":\"active\",\"actionType\":\"Earnings\",\"modTitle\":\"Being Active\",\"userTitle\":\"Active\",\"userDescription\":\"Participation is key. A reward to those that are present\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":6,\"optionDescription\":\"Points per Tick\"},{\"optionName\":\"interval\",\"optionType\":\"time\",\"optionValue\":100,\"optionDescription\":\"Tick Interval\"}]},{\"name\":\"addingVid\",\"actionType\":\"Earnings\",\"modTitle\":\"Adding a video\",\"userTitle\":\"Submitting Media\",\"userDescription\":\"Providing media is the foundation of the application and is the catalyst for valuable data\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":6,\"optionDescription\":\"Points per Video\"}]},{\"name\":\"skipped\",\"actionType\":\"Losses\",\"modTitle\":\"Having your video skipped\",\"userTitle\":\"Unsatisfactory Media\",\"userDescription\":\"Not all media is created equal and it\'s important to ensure you\'re providing the highest quality content. Please do better in the future. Don\'t fucking post family guy. Or anime.\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":6,\"optionDescription\":\"Points lost\"}]},{\"name\":\"highlight\",\"actionType\":\"Expenditures\",\"modTitle\":\"Highlight\",\"userTitle\":\"Highlight\",\"userDescription\":\"Individuality provides a sense of self-expression and personal fulfillment. While modest, this chat message will help you stand out\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":15,\"optionDescription\":\"Cost\"},{\"optionName\":\"command\",\"optionType\":\"string\",\"optionValue\":\"/highlight\",\"optionDescription\":\"Usage: /highlight\"}]},{\"name\":\"skip\",\"actionType\":\"Expenditures\",\"modTitle\":\"Skipping a video\",\"userTitle\":\"\\\"Sister\\\"ing Content\",\"userDescription\":\"As a publicly accountable organization, we are compelled to express our sincerest apprehension regarding the participation of incest.\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":20,\"optionDescription\":\"Cost\"}]},{\"name\":\"danmu\",\"actionType\":\"Expenditures\",\"modTitle\":\"Danmaku (\'On Screen\' Comments)\",\"userTitle\":\"Danmu\",\"userDescription\":\"AKA: Danmaku or barrage or niconico video is usually described as は、ニコニコ動画で流れる文字コメントのことで、動画をより楽しい  (•◡•) /コメントが彩ります\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":250,\"optionDescription\":\"Cost\"},{\"optionName\":\"command\",\"optionType\":\"string\",\"optionValue\":\"/danmu\",\"optionDescription\":\"Usage: /danmu\"}]},{\"name\":\"secretary\",\"actionType\":\"Expenditures\",\"modTitle\":\"Super Invasive Chat\",\"userTitle\":\"Invasive Chat Message\",\"userDescription\":\"Children who are often deprived of attention resort to frequent disruptions through auditory and visual harassment. To be noticed, to be seen, is to be reminded that you\'re alive; that you matter. Use her wisely.\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":10000,\"optionDescription\":\"Cost\"},{\"optionName\":\"command\",\"optionType\":\"string\",\"optionValue\":\"/secretary\",\"optionDescription\":\"Usage: /secretary\"}]},{\"name\":\"debtlvl0\",\"actionType\":\"Statuses\",\"modTitle\":\"Debt Level 0 - Stutter filter\",\"userTitle\":\"Debt Level 0 - Repeating Interruptions of Typical Speech\",\"userDescription\":\"Our bio-integrated cryptocurrency may cause speech repetition due to additional Proof of Work requirements for users below a certain threshold.\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":5,\"optionDescription\":\"Points below\"}]},{\"name\":\"debtlvl1\",\"actionType\":\"Statuses\",\"modTitle\":\"Debt Level 1 - Lisp filter\",\"userTitle\":\"Debt Level 1 - Further Degradation of Speech\",\"userDescription\":\"It\'s unsure if this effect is the result of impaired faculties or if it\'s a best estimation of what the fiscally irresponsible sound like.\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":-10,\"optionDescription\":\"Points below\"}]},{\"name\":\"debtlvl2\",\"actionType\":\"Statuses\",\"modTitle\":\"Debt Level 2 - Random Ad\",\"userTitle\":\"Debt Level 2 - Occasional Content Insertion to Recoup Cost\",\"userDescription\":\"To avoid the ability to provide you with more opportunities to contribute, we require external sources to keep operating costs nominal.\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":-100,\"optionDescription\":\"Points below\"}]},{\"name\":\"debtlvl3\",\"actionType\":\"Statuses\",\"modTitle\":\"Debt Level 3 - \'Coolhole1\' Text\",\"userTitle\":\"Debt Level 3 - Lower Physical Footprint\",\"userDescription\":\"As your brain and body begin to degrade, it becomes necessary to reduce swelling by reducing the text size reducing necessary throughput to continue minimal cognitive development.\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":-500,\"optionDescription\":\"Points below\"}]},{\"name\":\"debtlvl4\",\"actionType\":\"Statuses\",\"modTitle\":\"Debt Level 4 - Letters Missing\",\"userTitle\":\"Debt Level 4 - Reduced Bandwidth\",\"userDescription\":\"It\'s at this point that your brainwaves have become unstable and we cannot guarantee total transmission of your messages.\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":-1000,\"optionDescription\":\"Points below\"}]},{\"name\":\"debtlvl5\",\"actionType\":\"Statuses\",\"modTitle\":\"Debt Level 5 - \'Criticality Animation\'\",\"userTitle\":\"Debt Level 5 - Criticality Event\",\"userDescription\":\"Criticality accident likely. May God have mercy on your soul.\",\"options\":[{\"optionName\":\"enabled\",\"optionType\":\"bool\",\"optionValue\":true,\"optionDescription\":\"Enable\"},{\"optionName\":\"points\",\"optionType\":\"int\",\"optionValue\":-2000,\"optionDescription\":\"Points below\"}]}]');
/*!40000 ALTER TABLE `channel_data` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `channel_libraries`
--

DROP TABLE IF EXISTS `channel_libraries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `channel_libraries` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `seconds` int(11) NOT NULL,
  `type` varchar(2) NOT NULL,
  `meta` text NOT NULL,
  `channel` varchar(30) NOT NULL,
  PRIMARY KEY (`id`,`channel`),
  KEY `channel_libraries_channel_title` (`channel`,`title`(227))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channel_libraries`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `channel_libraries` WRITE;
/*!40000 ALTER TABLE `channel_libraries` DISABLE KEYS */;
/*!40000 ALTER TABLE `channel_libraries` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `channel_ranks`
--

DROP TABLE IF EXISTS `channel_ranks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `channel_ranks` (
  `name` varchar(20) NOT NULL,
  `rank` int(11) NOT NULL,
  `channel` varchar(30) NOT NULL,
  PRIMARY KEY (`name`,`channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channel_ranks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `channel_ranks` WRITE;
/*!40000 ALTER TABLE `channel_ranks` DISABLE KEYS */;
INSERT INTO `channel_ranks` VALUES
('test',5,'coolesthole');
/*!40000 ALTER TABLE `channel_ranks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `channels`
--

DROP TABLE IF EXISTS `channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `channels` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `owner` varchar(20) NOT NULL,
  `time` bigint(20) NOT NULL,
  `last_loaded` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `owner_last_seen` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `channels_name_unique` (`name`),
  KEY `channels_owner_index` (`owner`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `channels`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `channels` WRITE;
/*!40000 ALTER TABLE `channels` DISABLE KEYS */;
INSERT INTO `channels` VALUES
(1,'coolesthole','test',1772054416031,'2026-02-25 22:17:52','2026-02-25 22:17:52');
/*!40000 ALTER TABLE `channels` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `global_bans`
--

DROP TABLE IF EXISTS `global_bans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_bans` (
  `ip` varchar(39) NOT NULL,
  `reason` varchar(255) NOT NULL,
  PRIMARY KEY (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_bans`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `global_bans` WRITE;
/*!40000 ALTER TABLE `global_bans` DISABLE KEYS */;
/*!40000 ALTER TABLE `global_bans` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `media_metadata_cache`
--

DROP TABLE IF EXISTS `media_metadata_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_metadata_cache` (
  `id` varchar(255) NOT NULL,
  `type` varchar(2) NOT NULL,
  `metadata` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`type`,`id`),
  KEY `media_metadata_cache_updated_at_index` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_metadata_cache`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `media_metadata_cache` WRITE;
/*!40000 ALTER TABLE `media_metadata_cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_metadata_cache` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `meta`
--

DROP TABLE IF EXISTS `meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `meta` (
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meta`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `meta` WRITE;
/*!40000 ALTER TABLE `meta` DISABLE KEYS */;
INSERT INTO `meta` VALUES
('db_version','12');
/*!40000 ALTER TABLE `meta` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `password_reset`
--

DROP TABLE IF EXISTS `password_reset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset` (
  `ip` varchar(39) NOT NULL,
  `name` varchar(20) NOT NULL,
  `hash` varchar(64) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expire` bigint(20) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `password_reset` WRITE;
/*!40000 ALTER TABLE `password_reset` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `user_deletion_requests`
--

DROP TABLE IF EXISTS `user_deletion_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_deletion_requests` (
  `request_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`request_id`),
  UNIQUE KEY `user_deletion_requests_user_id_unique` (`user_id`),
  KEY `user_deletion_requests_created_at_index` (`created_at`),
  CONSTRAINT `user_deletion_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_deletion_requests`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `user_deletion_requests` WRITE;
/*!40000 ALTER TABLE `user_deletion_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_deletion_requests` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `user_playlists`
--

DROP TABLE IF EXISTS `user_playlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_playlists` (
  `user` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contents` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `count` int(11) NOT NULL,
  `duration` int(11) NOT NULL,
  PRIMARY KEY (`user`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_playlists`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `user_playlists` WRITE;
/*!40000 ALTER TABLE `user_playlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_playlists` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `password` varchar(60) NOT NULL,
  `global_rank` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `profile` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `ip` varchar(39) NOT NULL,
  `time` bigint(20) NOT NULL,
  `name_dedupe` varchar(20) DEFAULT NULL,
  `inactive` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'test','$2b$10$Kc4DGyJHGKi14oO7w3YiDuguugwuDpnSk82DcYIzgnEFVHf9vYMS2',255,'','','192.168.32.1',1772054398927,'test',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-02-25 22:18:00
