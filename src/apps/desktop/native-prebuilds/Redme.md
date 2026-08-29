# Native Prebuilds (Pandhora Desktop)

Este diretório contém os binários nativos pré-compilados (`.node`) utilizados pelo processo principal do Electron.

## 📌 Por que este binário está commitado?

O `window_overlay.node` é um addon C++ (Node-API) responsável por interceptar `WM_MOUSEACTIVATE` via Win32 `WndProc`. Ele permite interagir com o widget flutuante sem roubar o foco (`ForegroundWindow`) de outras aplicações, prevenindo o _Background Timer Throttling_ do Chrome/navegadores.

Manter o binário pré-compilado elimina a necessidade de instalar Python, Visual Studio C++ Build Tools e `node-gyp` no ambiente de CI/CD e nas máquinas de desenvolvimento comuns.

---

## 🛠️ Como recompilar (apenas se alterar o C++)

Caso o arquivo `src/main/native/window_overlay.cc` seja modificado, siga os passos abaixo no Windows com o toolset C++ instalado:

1. Navegue até o workspace do desktop:

   ```bash
   cd src/apps/desktop
   ```

   Execute o rebuild nativo:

   ```bash
   yarn native:rebuild
   ```

   Copie o binário gerado para esta pasta substituindo o antigo:

   ```bash
   copy build\Release\window_overlay.node native-prebuilds\window_overlay.node
   ```

Commite o novo arquivo .node atualizado.
