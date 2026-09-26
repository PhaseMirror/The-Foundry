try:
    from kernel import RGFlowResult
except ImportError:
    try:
        from sigma_kernel.kernel import RGFlowResult
    except ImportError:
        # Fallback if neither found
        from dataclasses import dataclass
        import numpy as np
        @dataclass
        class RGFlowResult:
            scales: np.ndarray
            lambda4: np.ndarray
            lambda6: np.ndarray
            c2: np.ndarray
            c3: np.ndarray
            c4: np.ndarray
            spectral_radii: np.ndarray
            spectral_radius_global: float
            prime_index: int
