#include <napi.h>
#include <windows.h>

static WNDPROC ElectronOriginalWndProc = nullptr;
static HWND g_OverlayHwnd = nullptr;
static HWINEVENTHOOK g_EventHook = nullptr;

// Reafirma a janela no topo absoluto da banda TOPMOST sem roubar foco
void ReassertTopmost(HWND hwnd) {
    if (hwnd && IsWindow(hwnd)) {
        SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0,
                     SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_NOOWNERZORDER);
    }
}

// Callback executado pelo Windows sempre que outra janela assume o Foreground
VOID CALLBACK WinEventProc(
    HWINEVENTHOOK hWinEventHook,
    DWORD event,
    HWND hwnd,
    LONG idObject,
    LONG idChild,
    DWORD dwEventThread,
    DWORD dwmsEventTime
) {
    if (event == EVENT_SYSTEM_FOREGROUND && g_OverlayHwnd) {
        // Se a nova janela ativa não for o próprio Metric, reaplica o topo
        if (hwnd != g_OverlayHwnd) {
            ReassertTopmost(g_OverlayHwnd);
        }
    }
}

LRESULT CALLBACK MetricCustomWndProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_MOUSEACTIVATE:
            // Permite clicar nos botões do React sem roubar o Foreground
            return MA_NOACTIVATE;

        case WM_WINDOWPOSCHANGING: {
            WINDOWPOS* pWinPos = reinterpret_cast<WINDOWPOS*>(lParam);
            pWinPos->flags |= SWP_NOACTIVATE;
            break;
        }
    }
    return CallWindowProc(ElectronOriginalWndProc, hwnd, uMsg, wParam, lParam);
}

Napi::Value ApplyOverlayStyles(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1 || !info[0].IsBuffer()) {
        Napi::TypeError::New(env, "Buffer HWND esperado").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Buffer<void*> buffer = info[0].As<Napi::Buffer<void*>>();
    HWND hwnd = *reinterpret_cast<HWND*>(buffer.Data());

    if (!hwnd || !IsWindow(hwnd)) {
        return Napi::Boolean::New(env, false);
    }

    g_OverlayHwnd = hwnd;

    // Estilos: WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW e WS_EX_TOPMOST
    LONG_PTR styles = GetWindowLongPtr(hwnd, GWL_EXSTYLE);
    styles |= (WS_EX_NOACTIVATE | WS_EX_TOOLWINDOW | WS_EX_TOPMOST);
    SetWindowLongPtr(hwnd, GWL_EXSTYLE, styles);

    ReassertTopmost(hwnd);

    if (!ElectronOriginalWndProc) {
        ElectronOriginalWndProc = reinterpret_cast<WNDPROC>(
            SetWindowLongPtr(hwnd, GWLP_WNDPROC, reinterpret_cast<LONG_PTR>(MetricCustomWndProc))
        );
    }

    // Registra hook global para EVENT_SYSTEM_FOREGROUND
    if (!g_EventHook) {
        g_EventHook = SetWinEventHook(
            EVENT_SYSTEM_FOREGROUND,
            EVENT_SYSTEM_FOREGROUND,
            NULL,
            WinEventProc,
            0,
            0,
            WINEVENT_OUTOFCONTEXT | WINEVENT_SKIPOWNPROCESS
        );
    }

    return Napi::Boolean::New(env, true);
}

Napi::Value ForceTopmost(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (g_OverlayHwnd) {
        ReassertTopmost(g_OverlayHwnd);
    }
    return env.Null();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "applyOverlayStyles"), Napi::Function::New(env, ApplyOverlayStyles));
    exports.Set(Napi::String::New(env, "forceTopmost"), Napi::Function::New(env, ForceTopmost));
    return exports;
}

NODE_API_MODULE(window_overlay, Init)