import os
from pathlib import Path

def arbol_simple():
    """Versión simple que genera el árbol en el directorio actual"""
    with open("arbol_directorios.txt", "w", encoding="utf-8") as f:
        f.write("Árbol de directorios\n")
        f.write("====================\n\n")
        
        directorio_actual = Path(".").resolve()
        f.write(f"Directorio: {directorio_actual}\n\n")
        
        # Primer nivel
        for item in sorted(directorio_actual.iterdir()):
            if item.is_dir():
                f.write(f"📁 {item.name}/\n")
                # Segundo nivel
                try:
                    for subitem in sorted(item.iterdir()):
                        if subitem.is_dir():
                            f.write(f"   └── 📁 {subitem.name}/\n")
                        else:
                            f.write(f"   └── 📄 {subitem.name}\n")
                except PermissionError:
                    f.write(f"   └── 🔒 [Acceso denegado]\n")
            else:
                f.write(f"📄 {item.name}\n")

if __name__ == "__main__":
    arbol_simple()
    print("✅ Archivo 'arbol_directorios.txt' creado exitosamente!")