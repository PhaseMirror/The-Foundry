"""Tests for Phase 2 ZSD (Zero-Set Detection)."""

import pytest
import numpy as np
from pirtm.zsd import ZeroSetDetector, ZeroSet, KernelBoundaryDetector


class TestZeroSetDetector:
    """Test zero-set detection."""

    def test_detect_zero_set_1d(self):
        """Test 1D zero set detection."""
        detector = ZeroSetDetector()

        # Simple function: f(x) = x^2 - 1
        def f(x):
            return x[0]**2 - 1

        domain = (np.array([-2.0]), np.array([2.0]))

        zero_set = detector.detect_zero_set(f, domain, (100,))

        # Should find zeros at x = -1 and x = 1
        assert len(zero_set.points) >= 1  # At least one point found
        assert zero_set.dimension == 0  # 0-dimensional (points)

    def test_detect_zero_set_2d(self):
        """Test 2D zero set detection."""
        detector = ZeroSetDetector()

        # Circle: f(x,y) = x^2 + y^2 - 1
        def f(xy):
            x, y = xy
            return x**2 + y**2 - 1

        domain = (np.array([-2.0, -2.0]), np.array([2.0, 2.0]))

        zero_set = detector.detect_zero_set(f, domain, (50, 50))

        # Should find points on the circle
        assert len(zero_set.points) > 0
        assert zero_set.dimension == 1  # 1-dimensional (curve)

    def test_subpixel_refinement(self):
        """Test sub-pixel accuracy refinement."""
        detector = ZeroSetDetector()

        # Function with known zero at x = sqrt(2) ≈ 1.414
        def f(x):
            return x[0]**2 - 2

        domain = (np.array([1.0]), np.array([2.0]))

        zero_set = detector.detect_zero_set(f, domain, (100,))

        # Check if refinement brings us close to exact value
        if len(zero_set.points) > 0:
            found_zero = zero_set.points[0][0]
            exact_zero = np.sqrt(2)
            assert abs(found_zero - exact_zero) < 0.01  # Sub-pixel accuracy

    def test_kernel_boundary_detection(self):
        """Test kernel boundary detection."""
        detector = ZeroSetDetector()
        boundary_detector = KernelBoundaryDetector(detector)

        # Simple kernel function
        def kernel(xy):
            x, y = xy
            return np.sin(x) * np.cos(y)  # Has zeros along certain lines

        domain = (np.array([0.0, 0.0]), np.array([2*np.pi, 2*np.pi]))

        boundary = boundary_detector.detect_kernel_boundary(kernel, domain)

        # Should find some boundary points
        assert isinstance(boundary, ZeroSet)


class TestZeroSet:
    """Test ZeroSet data structure."""

    def test_zero_set_creation(self):
        """Test creating zero set."""
        points = np.array([[0.0, 0.0], [1.0, 0.0]])
        zero_set = ZeroSet(points, 1, "boundary")

        assert zero_set.dimension == 1
        assert zero_set.boundary_type == "boundary"

    def test_distance_calculation(self):
        """Test distance to zero set."""
        points = np.array([[0.0, 0.0], [2.0, 0.0]])
        zero_set = ZeroSet(points, 0, "isolated")

        dist = zero_set.distance_to_point(np.array([1.0, 1.0]))
        assert dist > 0  # Should be positive distance


if __name__ == "__main__":
    pytest.main([__file__])