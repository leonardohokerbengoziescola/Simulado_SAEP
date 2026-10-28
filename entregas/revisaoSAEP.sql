-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema revisaoSAEP
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `revisaoSAEP` DEFAULT CHARACTER SET utf8 ;
USE `revisaoSAEP` ;

-- -----------------------------------------------------
-- Table `revisaoSAEP`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `revisaoSAEP`.`usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NULL,
  `login` VARCHAR(50) NULL,
  `senha` VARCHAR(255) NULL,
  PRIMARY KEY (`id_usuario`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `revisaoSAEP`.`aluno`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `revisaoSAEP`.`aluno` (
  `id_aluno` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NULL,
  `CPF` VARCHAR(100) NULL,
  `telefone` VARCHAR(11) NULL,
  `email` VARCHAR(45) NULL,
  PRIMARY KEY (`id_aluno`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `revisaoSAEP`.`plano_treino`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `revisaoSAEP`.`plano_treino` (
  `id_plano` INT NOT NULL AUTO_INCREMENT,
  `descricao` VARCHAR(45) NULL,
  `data_inicio` DATE NULL,
  `data_fim` DATE NULL,
  `aluno_id_aluno` INT NOT NULL,
  PRIMARY KEY (`id_plano`),
  INDEX `fk_plano_treino_aluno_idx` (`aluno_id_aluno` ASC) VISIBLE,
  CONSTRAINT `fk_plano_treino_aluno`
    FOREIGN KEY (`aluno_id_aluno`)
    REFERENCES `revisaoSAEP`.`aluno` (`id_aluno`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `revisaoSAEP`.`agendamento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `revisaoSAEP`.`agendamento` (
  `id_agendamento` INT NOT NULL AUTO_INCREMENT,
  `data_aula` DATETIME NULL,
  `status` VARCHAR(45) NULL,
  `aluno_id_aluno` INT NOT NULL,
  `plano_treino_id_plano` INT NOT NULL,
  PRIMARY KEY (`id_agendamento`),
  INDEX `fk_agendamento_aluno1_idx` (`aluno_id_aluno` ASC) VISIBLE,
  INDEX `fk_agendamento_plano_treino1_idx` (`plano_treino_id_plano` ASC) VISIBLE,
  CONSTRAINT `fk_agendamento_aluno1`
    FOREIGN KEY (`aluno_id_aluno`)
    REFERENCES `revisaoSAEP`.`aluno` (`id_aluno`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_agendamento_plano_treino1`
    FOREIGN KEY (`plano_treino_id_plano`)
    REFERENCES `revisaoSAEP`.`plano_treino` (`id_plano`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- População inicial de dados (Mínimo de 3 registros por tabela)
-- -----------------------------------------------------

INSERT INTO `revisaoSAEP`.`usuario` (`id_usuario`, `nome`, `login`, `senha`) VALUES
(1, 'Gerente Geral', 'gerente', '$2b$10$e8T3.g5z/3uQeY.qX2XJ.e1W5Z2dJ9Y8X7W6V5U4T3S2R1Q0P9O8N'),
(2, 'Recepcionista Maria', 'maria.recepcao', '$2b$10$f9U4.h6a/4vRfZ.rY3YK.f2X6a3eK0Z9Y8X7W6V5U4T3S2R1Q0P9'), (3, 'Atendente Joao', 'joao.atendimento', '$2b$10$g0V5.i7b/5wSga.sZ4ZL.g3Y7b4fL1a0Z9Y8X7W6V5U4T3S2R1Q0');

INSERT INTO `revisaoSAEP`.`aluno` (`id_aluno`, `nome`, `CPF`, `telefone`, `email`) VALUES
(1, 'Carlos Silva', 'U2FsdGVkX19v8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q==', '47999887766', 'carlos.silva@email.com'),
(2, 'Ana Souza', 'U2FsdGVkX1+a1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q==', '47988776655', 'ana.souza@email.com'),
(3, 'Roberto Oliveira', 'U2FsdGVkX1/b2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R==', '47977665544', 'roberto.oliveira@email.com');

INSERT INTO `revisaoSAEP`.`plano_treino` (`id_plano`, `descricao`, `data_inicio`, `data_fim`, `aluno_id_aluno`) VALUES
(1, 'Treino A/B - Hipertrofia', '2026-01-10', '2026-04-10', 1),
(2, 'Treino Cardiorrespiratório', '2026-02-01', '2026-05-01', 2),
(3, 'Reabilitação Funcional', '2026-03-15', '2026-06-15', 3);

INSERT INTO `revisaoSAEP`.`agendamento` (`id_agendamento`, `data_aula`, `status`, `aluno_id_aluno`, `plano_treino_id_plano`) VALUES
(1, '2026-10-25 08:00:00', 'Agendado', 1, 1),
(2, '2026-10-25 09:30:00', 'Agendado', 2, 2),
(3, '2026-10-26 14:00:00', 'Confirmado', 3, 3);

select * from usuario;
select * from aluno;
select * from plano_treino;
select * from agendamento;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;