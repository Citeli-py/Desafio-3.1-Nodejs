import time
import pyautogui

# Função para simular as entradas de teclado
def simular_entrada(entradas, delay_entre_teclas=0.01, delay_entre_entradas=0.2):
    """
    Simula a digitação das entradas fornecidas.

    Args:
    entradas (list): Lista de strings a serem digitadas.
    delay_entre_teclas (float): Tempo em segundos entre teclas individuais.
    delay_entre_entradas (float): Tempo em segundos entre entradas diferentes.
    """
    time.sleep(0.5)  # Tempo para dar tempo de focar no terminal com o código JS
    for entrada in entradas:
        # Ignora comentários
        if(entrada[0] != '#'):
            pyautogui.write(entrada, interval=delay_entre_teclas)  # Digita a entrada
            #pyautogui.press('enter')  # Pressiona Enter após cada entrada
            time.sleep(delay_entre_entradas)  # Espera entre as entradas
    
    pyautogui.press('enter') 

# Lista das entradas que serão enviadas ao código JavaScript
entradas = open("test/entradas.txt", 'r').readlines()

# Executa a simulação de entradas
simular_entrada(entradas)
