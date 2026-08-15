{
  "targets": [
    {
      "target_name": "window_overlay",
      "sources": [ "src/main/native/window_overlay.cc" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ]
    }
  ]
}