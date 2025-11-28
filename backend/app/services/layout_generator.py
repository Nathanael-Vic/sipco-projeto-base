from typing import List, Dict, Union

# Define o tamanho padrão de um piso elevado em milímetros.
TAMANHO_PISO_MM = 600
# Define o intervalo de pisos para a criação da malha de eletrocalhas.
INTERVALO_PISOS = 4
# Calcula o espaçamento final em milímetros.
ESPACAMENTO_MM = TAMANHO_PISO_MM * INTERVALO_PISOS

def gerar_layout_eletrocalhas_grid(largura_mm: int, altura_mm: int, capacidade_maxima_default: int = 100) -> List[Dict[str, Union[int, float]]]:
    """
    Gera uma lista de coordenadas para um layout de eletrocalhas em formato de grid,
    utilizando unidades de grid (1-based) em vez de milímetros.

    Args:
        largura_mm: A largura total da planta do data hall em milímetros.
        altura_mm: A altura total da planta do data hall em milímetros.
        capacidade_maxima_default: Capacidade máxima padrão para as eletrocalhas sugeridas.

    Returns:
        Uma lista de dicionários, onde cada dicionário representa uma eletrocalha
        com coordenadas em unidades de grid e capacidade máxima.
    """
    eletrocalhas_sugeridas = []

    # Calcula o número total de colunas e linhas no grid
    num_cols = largura_mm // TAMANHO_PISO_MM
    num_rows = altura_mm // TAMANHO_PISO_MM

    # Gera as eletrocalhas horizontais
    y = INTERVALO_PISOS
    while y <= num_rows:
        eletrocalha = {
            # "tipo": "horizontal", # Removido, inferido pelas coordenadas
            "ponto_a_x": 1,
            "ponto_a_y": y,
            "ponto_b_x": num_cols,
            "ponto_b_y": y,
            "capacidade_maxima": capacidade_maxima_default
        }
        eletrocalhas_sugeridas.append(eletrocalha)
        y += INTERVALO_PISOS

    # Gera as eletrocalhas verticais
    x = INTERVALO_PISOS
    while x <= num_cols:
        eletrocalha = {
            # "tipo": "vertical", # Removido, inferido pelas coordenadas
            "ponto_a_x": x,
            "ponto_a_y": 1,
            "ponto_b_x": x,
            "ponto_b_y": num_rows,
            "capacidade_maxima": capacidade_maxima_default
        }
        eletrocalhas_sugeridas.append(eletrocalha)
        x += INTERVALO_PISOS
        
    return eletrocalhas_sugeridas
