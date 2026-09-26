"""Zero-Set Detection (ZSD) for PIRTM Phase 2.

Implements boundary detection, zero-set finding, and sub-pixel accuracy
analysis for kernel boundary determination.
"""

from __future__ import annotations

from typing import Any, Callable, List, Optional, Tuple, Union
from dataclasses import dataclass
import numpy as np
from scipy import ndimage


@dataclass
class ZeroSet:
    """Representation of a zero set (solution to f(x) = 0)."""
    points: np.ndarray  # Points where function is zero
    dimension: int      # Dimension of the zero set
    boundary_type: str  # 'interior', 'boundary', 'isolated'

    def distance_to_point(self, point: np.ndarray) -> float:
        """Compute distance from point to zero set."""
        if len(self.points) == 0:
            return float('inf')

        distances = np.linalg.norm(self.points - point, axis=1)
        return float(np.min(distances))


class ZeroSetDetector:
    """Detector for zero sets with sub-pixel accuracy."""

    def __init__(self, tolerance: float = 1e-6, max_iterations: int = 100):
        self.tolerance = tolerance
        self.max_iterations = max_iterations

    def detect_zero_set(
        self,
        function: Callable[[np.ndarray], Union[float, np.ndarray]],
        domain: Tuple[np.ndarray, np.ndarray],
        resolution: Tuple[int, ...] = (100, 100)
    ) -> ZeroSet:
        """Detect zero set of function in given domain."""

        # Create grid
        grid = self._create_grid(domain, resolution)

        # Evaluate function on grid
        values = self._evaluate_on_grid(function, grid)

        # Find zero crossings
        zero_points = self._find_zero_crossings(grid, values)

        # Refine with sub-pixel accuracy
        refined_points = self._refine_zero_points(function, zero_points)

        # Determine dimension and type
        dimension = self._estimate_dimension(refined_points)
        boundary_type = self._classify_boundary_type(refined_points, domain)

        return ZeroSet(refined_points, dimension, boundary_type)

    def _create_grid(
        self,
        domain: Tuple[np.ndarray, np.ndarray],
        resolution: Tuple[int, ...]
    ) -> np.ndarray:
        """Create evaluation grid in domain."""

        lower, upper = domain
        axes = []

        for i, (low, high, res) in enumerate(zip(lower, upper, resolution)):
            axis = np.linspace(low, high, res)
            axes.append(axis)

        grid = np.meshgrid(*axes, indexing='ij')
        grid_points = np.stack(grid, axis=-1)
        grid_points = grid_points.reshape(-1, len(resolution))

        return grid_points

    def _evaluate_on_grid(
        self,
        function: Callable[[np.ndarray], Union[float, np.ndarray]],
        grid: np.ndarray
    ) -> np.ndarray:
        """Evaluate function on grid points."""

        values = []
        for point in grid:
            val = function(point)
            if np.isscalar(val):
                values.append(val)
            else:
                # For vector-valued functions, take norm
                values.append(np.linalg.norm(val))

        return np.array(values)

    def _find_zero_crossings(self, grid: np.ndarray, values: np.ndarray) -> np.ndarray:
        """Find approximate zero crossings using grid evaluation."""

        # Find points where function changes sign
        zero_indices = []

        if len(grid) == len(values):
            # 1D case
            for i in range(len(values) - 1):
                if values[i] * values[i + 1] <= 0:
                    # Linear interpolation
                    t = -values[i] / (values[i + 1] - values[i])
                    zero_point = grid[i] + t * (grid[i + 1] - grid[i])
                    zero_indices.append(zero_point)
        else:
            # Higher dimensional case - use contour finding
            # Reshape for contour detection
            shape = (int(np.sqrt(len(grid))), int(np.sqrt(len(grid))))
            if shape[0] * shape[1] == len(values):
                values_2d = values.reshape(shape)
                contours = self._find_contours(values_2d, 0.0)
                zero_indices.extend(contours)

        return np.array(zero_indices)

    def _find_contours(self, values_2d: np.ndarray, level: float) -> List[np.ndarray]:
        """Find contour lines at given level."""
        # Simple contour finding - in practice would use marching squares
        contours = []

        # Find zero crossings in rows
        for i in range(values_2d.shape[0]):
            row = values_2d[i, :]
            crossings = []
            for j in range(len(row) - 1):
                if (row[j] - level) * (row[j + 1] - level) <= 0:
                    t = (level - row[j]) / (row[j + 1] - row[j])
                    x = j + t
                    y = i
                    crossings.append([x, y])
            contours.extend(crossings)

        # Find zero crossings in columns
        for j in range(values_2d.shape[1]):
            col = values_2d[:, j]
            for i in range(len(col) - 1):
                if (col[i] - level) * (col[i + 1] - level) <= 0:
                    t = (level - col[i]) / (col[i + 1] - col[i])
                    x = j
                    y = i + t
                    contours.append([x, y])

        return contours

    def _refine_zero_points(
        self,
        function: Callable[[np.ndarray], Union[float, np.ndarray]],
        initial_points: np.ndarray
    ) -> np.ndarray:
        """Refine zero points with sub-pixel accuracy using Newton method."""

        refined_points = []

        for point in initial_points:
            refined = self._newton_refinement(function, point)
            if refined is not None:
                refined_points.append(refined)

        return np.array(refined_points)

    def _newton_refinement(
        self,
        function: Callable[[np.ndarray], Union[float, np.ndarray]],
        initial_point: np.ndarray,
        epsilon: float = 1e-10
    ) -> Optional[np.ndarray]:
        """Newton method for refining zero point."""

        x = initial_point.copy()
        h = 1e-8

        for _ in range(self.max_iterations):
            # Compute function value and gradient
            f_val = function(x)
            if np.isscalar(f_val):
                f_val = np.array([f_val])

            # Compute Jacobian (finite differences)
            n = len(x)
            jacobian = np.zeros((len(f_val), n))

            for i in range(n):
                x_plus = x.copy()
                x_plus[i] += h
                f_plus = function(x_plus)
                if np.isscalar(f_plus):
                    f_plus = np.array([f_plus])

                jacobian[:, i] = (f_plus - f_val) / h

            # Newton step
            try:
                delta = np.linalg.solve(jacobian.T @ jacobian, -jacobian.T @ f_val)
                x = x + delta

                # Check convergence
                if np.linalg.norm(delta) < epsilon:
                    return x

            except np.linalg.LinAlgError:
                # Singular Jacobian
                break

        return None

    def _estimate_dimension(self, points: np.ndarray) -> int:
        """Estimate dimension of zero set from point distribution."""

        if len(points) < 2:
            return 0  # Isolated points

        # For small number of points, likely 0-dimensional
        if len(points) <= 3:
            return 0

        # Compute pairwise distances
        distances = []
        for i in range(len(points)):
            for j in range(i + 1, len(points)):
                dist = np.linalg.norm(points[i] - points[j])
                distances.append(dist)

        if not distances:
            return 0

        # Estimate dimension based on distance distribution
        mean_dist = np.mean(distances)
        std_dist = np.std(distances)

        # Heuristic: low std suggests higher dimension
        if std_dist / mean_dist < 0.1:
            return len(points[0])  # Full dimension
        elif std_dist / mean_dist < 0.5:
            return len(points[0]) - 1  # Hypersurface
        else:
            return 0  # Isolated points

    def _classify_boundary_type(self, points: np.ndarray, domain: Tuple[np.ndarray, np.ndarray]) -> str:
        """Classify boundary type."""

        if len(points) == 0:
            return "empty"

        lower, upper = domain

        # Check if points are on domain boundary
        on_boundary = []
        for point in points:
            is_on_boundary = False
            for i, (p, l, u) in enumerate(zip(point, lower, upper)):
                if abs(p - l) < 1e-6 or abs(p - u) < 1e-6:
                    is_on_boundary = True
                    break
            on_boundary.append(is_on_boundary)

        if all(on_boundary):
            return "boundary"
        elif any(on_boundary):
            return "mixed"
        else:
            return "interior"


class KernelBoundaryDetector:
    """Specialized detector for kernel boundaries using ZSD."""

    def __init__(self, detector: ZeroSetDetector):
        self.detector = detector

    def detect_kernel_boundary(
        self,
        kernel_function: Callable[[np.ndarray], Union[float, np.ndarray]],
        domain: Tuple[np.ndarray, np.ndarray]
    ) -> ZeroSet:
        """Detect kernel boundary where kernel function vanishes."""

        # For kernel boundaries, we look for where the kernel is zero
        # or has specific properties

        def boundary_function(x: np.ndarray) -> float:
            # Example: detect where kernel has zero derivative or specific value
            k_val = kernel_function(x)
            if np.isscalar(k_val):
                return k_val
            else:
                # For vector kernels, detect zero crossings in components
                return np.min(np.abs(k_val))  # Distance to zero

        return self.detector.detect_zero_set(boundary_function, domain)

    def subpixel_boundary_refinement(
        self,
        boundary: ZeroSet,
        kernel_function: Callable[[np.ndarray], Union[float, np.ndarray]],
        precision: float = 1e-10
    ) -> ZeroSet:
        """Refine boundary detection to sub-pixel accuracy."""

        refined_points = []

        for point in boundary.points:
            # Use Newton refinement for higher accuracy
            refined = self.detector._newton_refinement(kernel_function, point, precision)
            if refined is not None:
                refined_points.append(refined)

        return ZeroSet(
            np.array(refined_points),
            boundary.dimension,
            boundary.boundary_type
        )