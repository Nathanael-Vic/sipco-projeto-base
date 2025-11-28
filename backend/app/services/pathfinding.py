import networkx as nx
from typing import List, Dict, Any, Tuple, Set
from app.db.supabase_client import supabase_client
import math

# Função auxiliar para obter todas as células da grid cobertas por uma eletrocalha
def _get_grid_cells_covered_by_eletrocalha(calha: Dict[str, Any]) -> List[Tuple[int, int]]:
    cells = []
    x1, y1 = calha['ponto_a_x'], calha['ponto_a_y']
    x2, y2 = calha['ponto_b_x'], calha['ponto_b_y']

    if x1 == x2: # Eletrocalha vertical
        for y in range(min(y1, y2), max(y1, y2) + 1):
            cells.append((x1, y))
    elif y1 == y2: # Eletrocalha horizontal
        for x in range(min(x1, x2), max(x1, x2) + 1):
            cells.append((x, y1))
    # Para eletrocalhas diagonais (não suportadas no MVP, mas para futura expansão)
    # else:
    #     # Implementar lógica para diagonais, se necessário
    #     pass
    return cells

def find_best_route(project_id: int, source_rack_id: int, destination_rack_id: int, token: str) -> Dict[str, Any]:
    """
    Encontra a rota mais curta entre dois racks usando a rede de eletrocalhas,
    considerando que racks podem se conectar a qualquer ponto da eletrocalha.

    Args:
        project_id: O ID do projeto.
        source_rack_id: O ID do rack de origem.
        destination_rack_id: O ID do rack de destino.
        token: O token de autenticação do usuário.

    Returns:
        Um dicionário contendo a rota (lista de eletrocalhas) e a distância total.
    """
    supabase_client.postgrest.auth(token)

    print(f"Iniciando find_best_route para project_id={project_id}, source_rack_id={source_rack_id}, destination_rack_id={destination_rack_id}")

    # 1. Buscar todos os dados relevantes do projeto
    try:
        racks_res = supabase_client.table("Racks").select("*").eq("project_id", project_id).execute()
        eletrocalhas_res = supabase_client.table("Eletrocalhas").select("*").eq("project_id", project_id).execute()
        
        racks = racks_res.data
        eletrocalhas = eletrocalhas_res.data

        print(f"Racks fetched: {racks}")
        print(f"Eletrocalhas fetched: {eletrocalhas}")

    except Exception as e:
        print(f"ERRO ao buscar dados do banco: {e}")
        raise Exception(f"Erro ao buscar dados do banco: {e}")

    if not racks or not eletrocalhas:
        return {"error": "Não foram encontrados racks ou eletrocalhas para este projeto."}

    # 2. Encontrar os racks de origem e destino
    source_rack = next((r for r in racks if r['id'] == source_rack_id), None)
    dest_rack = next((r for r in racks if r['id'] == destination_rack_id), None)

    print(f"Source Rack: {source_rack}")
    print(f"Destination Rack: {dest_rack}")

    if not source_rack or not dest_rack:
        return {"error": "Rack de origem ou destino não encontrado."}

    # 3. Construir o grafo com base em células da grid e segmentos de eletrocalhas
    G = nx.Graph()
    eletrocalha_segments_map: Dict[Tuple[Tuple[int, int], Tuple[int, int]], Dict[str, Any]] = {}

    for calha in eletrocalhas:
        cells_covered = _get_grid_cells_covered_by_eletrocalha(calha)
        print(f"Eletrocalha {calha['id']} ({calha['nome']}) cobre células: {cells_covered}")
        
        # Cria arestas entre células adjacentes cobertas pela mesma eletrocalha
        for i in range(len(cells_covered) - 1):
            u = cells_covered[i]
            v = cells_covered[i+1]
            
            # Garante que a aresta é adicionada de forma canônica para mapeamento
            edge_key = tuple(sorted((u, v)))
            
            # Adiciona a aresta ao grafo. Peso é 1 unidade de grid.
            if not G.has_edge(u, v):
                G.add_edge(u, v, weight=1, eletrocalha_id=calha['id'], eletrocalha_obj=calha)
                eletrocalha_segments_map[edge_key] = calha

    print(f"Grafo G construído. Total de NÓS: {len(G.nodes)}. Total de ARESTAS: {len(G.edges)}")
    # print(f"Nós do Grafo G: {G.nodes}") # Pode ser muito grande
    # print(f"Arestas do Grafo G: {G.edges}") # Pode ser muito grande

    # 4. Definir nós de origem e destino (posições dos racks)
    source_node_pos = (source_rack['coordenada_x'], source_rack['coordenada_y'])
    dest_node_pos = (dest_rack['coordenada_x'], dest_rack['coordenada_y'])

    print(f"Verificando conexão para Source Node: {source_node_pos}. Presente no grafo: {source_node_pos in G.nodes}")
    print(f"Verificando conexão para Dest Node: {dest_node_pos}. Presente no grafo: {dest_node_pos in G.nodes}")

    # Verifica se as posições dos racks são alcançáveis na rede de eletrocalhas
    if source_node_pos not in G.nodes:
        return {"error": f"O rack de origem '{source_rack['nome']}' na posição {source_node_pos} não está conectado a nenhuma eletrocalha."}
    if dest_node_pos not in G.nodes:
        return {"error": f"O rack de destino '{dest_rack['nome']}' na posição {dest_node_pos} não está conectado a nenhuma eletrocalha."}

    # 5. Calcular a rota mais curta
    try:
        path_nodes_sequence = nx.shortest_path(G, source=source_node_pos, target=dest_node_pos, weight='weight')
        path_length_grid_units = nx.shortest_path_length(G, source=source_node_pos, target=dest_node_pos, weight='weight')
        print(f"Caminho encontrado (nós): {path_nodes_sequence}")
        print(f"Comprimento do caminho (unidades de grid): {path_length_grid_units}")

    except nx.NetworkXNoPath:
        print(f"ERRO: Não foi encontrado um caminho entre {source_node_pos} e {dest_node_pos}.")
        return {"error": "Não foi encontrado um caminho entre os racks selecionados através das eletrocalhas existentes."}
    except nx.NodeNotFound as e:
         print(f"ERRO: A posição de um dos racks ({e.args[0]}) não pôde ser encontrada na rede de roteamento.")
         return {"error": f"A posição de um dos racks ({e.args[0]}) não pôde ser encontrada na rede de roteamento."}

    # 6. Converter o caminho de nós de volta para uma lista de eletrocalhas únicas
    path_eletrocalhas_unique: List[Dict[str, Any]] = []
    added_eletrocalha_ids: Set[int] = set()
    
    for i in range(len(path_nodes_sequence) - 1):
        u_node = path_nodes_sequence[i]
        v_node = path_nodes_sequence[i+1]
        
        # Recupera a eletrocalha original que forma este segmento
        # Pode haver múltiplos segmentos da mesma eletrocalha
        if G.has_edge(u_node, v_node):
            edge_data = G.get_edge_data(u_node, v_node)
            original_eletrocalha = edge_data['eletrocalha_obj']
            
            if original_eletrocalha['id'] not in added_eletrocalha_ids:
                path_eletrocalhas_unique.append(original_eletrocalha)
                added_eletrocalha_ids.add(original_eletrocalha['id'])
        else:
            print(f"ERRO: Segmento de rota inválido encontrado entre {u_node} e {v_node}.")
            return {"error": f"Segmento de rota inválido encontrado entre {u_node} e {v_node}."}
    
    # A distância do pathfinding é em unidades de grid. Multiplicamos por 600mm e convertemos para metros.
    distancia_total_m = (path_length_grid_units * 600) / 1000

    print(f"Rota encontrada: {path_eletrocalhas_unique}")
    print(f"Distância total: {distancia_total_m}m")

    return {
        "rota": path_eletrocalhas_unique,
        "distancia_total_m": round(distancia_total_m, 2)
    }