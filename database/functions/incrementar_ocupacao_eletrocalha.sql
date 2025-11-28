CREATE OR REPLACE FUNCTION incrementar_ocupacao_eletrocalha(eletrocalha_id_param INT, incremento INT)
RETURNS void AS $$
BEGIN
  UPDATE eletrocalhas
  SET ocupacao_total = ocupacao_total + incremento
  WHERE id = eletrocalha_id_param;
END;
$$ LANGUAGE plpgsql;
