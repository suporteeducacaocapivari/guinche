-- ================================================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO (Supabase SQL Editor)
-- ================================================================
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/vicxjzsfqloedmayejoy/sql/new
-- ================================================================

-- 1. Cria a tabela de senha_atual
CREATE TABLE IF NOT EXISTS senha_atual (
  id INT PRIMARY KEY DEFAULT 1,
  numero INT NOT NULL DEFAULT 0,
  guiche TEXT NOT NULL DEFAULT '---',
  timestamp BIGINT NOT NULL DEFAULT 0,
  senha_formatada TEXT NOT NULL DEFAULT '---',
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insere a linha inicial se não existir
INSERT INTO senha_atual (id, numero, guiche, timestamp, senha_formatada)
VALUES (1, 0, '---', 0, '---')
ON CONFLICT (id) DO NOTHING;

-- 2. Cria a tabela de contador
CREATE TABLE IF NOT EXISTS contador (
  id INT PRIMARY KEY DEFAULT 1,
  valor INT NOT NULL DEFAULT 0,
  CONSTRAINT single_row_cont CHECK (id = 1)
);

INSERT INTO contador (id, valor)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 3. Cria a tabela de histórico
CREATE TABLE IF NOT EXISTS historico (
  id BIGSERIAL PRIMARY KEY,
  numero INT NOT NULL,
  guiche TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  senha_formatada TEXT NOT NULL
);

-- 4. Cria a tabela de trigger (chamar novamente)
CREATE TABLE IF NOT EXISTS trigger_chamar (
  id INT PRIMARY KEY DEFAULT 1,
  ativo BOOLEAN NOT NULL DEFAULT false,
  timestamp BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT single_row_trig CHECK (id = 1)
);

INSERT INTO trigger_chamar (id, ativo, timestamp)
VALUES (1, false, 0)
ON CONFLICT (id) DO NOTHING;

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_timestamp ON historico (timestamp DESC);

-- 6. Função para limpar histórico antigo (mantém apenas os últimos N registros)
CREATE OR REPLACE FUNCTION limpar_historico_antigo(max_registros INT DEFAULT 5)
RETURNS void AS $$
BEGIN
  DELETE FROM historico
  WHERE id NOT IN (
    SELECT id FROM historico
    ORDER BY timestamp DESC
    LIMIT max_registros
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. HABILITAR REAL-TIME (IMPORTANTE!)
-- Essas linhas ativam a escuta em tempo real nas tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE senha_atual;
ALTER PUBLICATION supabase_realtime ADD TABLE historico;
ALTER PUBLICATION supabase_realtime ADD TABLE trigger_chamar;
ALTER PUBLICATION supabase_realtime ADD TABLE contador;
