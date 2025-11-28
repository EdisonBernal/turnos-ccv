"use client"

export function ConnectionError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-linear-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-linear-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.111 16H5m0 0a4 4 0 010-8m0 8a4 4 0 000-8m11.409-1a4.5 4.5 0 10-9-0v.005L12 5m0 0a4 4 0 000 8m0-8a4 4 0 010 8"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Sin conexión</h1>
            <p className="text-slate-600">No podemos conectar con el servidor en este momento.</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Verifica tu conexión a internet</span> y recarga la página para intentar
              de nuevo.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              Recargar página
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Si el problema persiste, intenta más tarde o contacta al administrador.
          </p>
        </div>
      </div>
    </div>
  )
}
