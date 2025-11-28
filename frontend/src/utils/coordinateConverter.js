/**
 * Converte um índice de coluna (base 0) para um nome de duas letras (ex: 0 -> 'AA', 26 -> 'BA').
 * @param {number} rowIndex - O índice da linha.
 * @returns {string} O nome da linha formatado.
 */
export function toRowName(rowIndex) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (rowIndex < 0) return 'A'; // Fallback
    
    // Trata a conversão como um sistema de base 26 para gerar duas letras
    const firstLetter = alphabet[Math.floor(rowIndex / 26) % 26];
    const secondLetter = alphabet[rowIndex % 26];

    return `${firstLetter}${secondLetter}`;
}

/**
 * Converte um índice de coluna (base 0) para um nome de dois dígitos com zero à esquerda (ex: 1 -> '01').
 * @param {number} colIndex - O índice da coluna.
 * @returns {string} O nome da coluna formatado.
 */
export function toColumnName(colIndex) {
    return colIndex.toString().padStart(2, '0');
}

/**
 * Converte coordenadas em milímetros para o sistema de grade alfanumérico.
 * @param {number} x_mm - A coordenada X em milímetros.
 * @param {number} y_mm - A coordenada Y em milímetros.
 * @param {number} gridSize_mm - O tamanho da célula da grade em milímetros.
 * @returns {{rowName: string, colName: string}} O nome da linha e da coluna.
 */
export function toGridCoordinates(x_mm, y_mm, gridSize_mm = 600) {
    // Subtrai 1 para garantir que a coordenada 600 caia no índice 1, não no índice 0
    const colIndex = Math.floor((x_mm - 1) / gridSize_mm);
    const rowIndex = Math.floor((y_mm - 1) / gridSize_mm);
    
    return {
        rowName: toRowName(rowIndex),
        colName: toColumnName(colIndex)
    };
}
