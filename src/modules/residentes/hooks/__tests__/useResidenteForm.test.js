import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResidenteForm } from '../useResidenteForm';

// Mock de las dependencias
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn(),
    handleSubmit: vi.fn(),
    formState: { errors: {} },
    setValue: vi.fn(),
    reset: vi.fn(),
    watch: vi.fn(),
    getValues: vi.fn()
  }))
}));

vi.mock('../../../services/apiService', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn()
  }
}));

vi.mock('../../../store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    usuario: { id_edificio: 1 }
  }))
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

/**
 * @file Pruebas para el hook useResidenteForm
 * Valida la lógica de formularios para creación/edición de residentes
 */
describe('useResidenteForm Hook', () => {

  describe('Estado inicial', () => {
    it('debe inicializar con valores por defecto', () => {
      const { result } = renderHook(() => useResidenteForm());

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isEditMode).toBe(false);
      expect(typeof result.current.onSubmit).toBe('function');
      expect(typeof result.current.handleCancel).toBe('function');
    });

    it('debe detectar modo edición cuando recibe residenteEditando', () => {
      const residenteEditando = { id: 1, nombre: 'Juan', email: 'juan@test.com' };

      const { result } = renderHook(() =>
        useResidenteForm({ residenteEditando })
      );

      expect(result.current.isEditMode).toBe(true);
    });
  });

  describe('Funcionalidad básica', () => {
    it('debe retornar todas las propiedades necesarias', () => {
      const { result } = renderHook(() => useResidenteForm());

      // Verificar que retorna todas las propiedades esperadas
      expect(result.current).toHaveProperty('isSubmitting');
      expect(result.current).toHaveProperty('isEditMode');
      expect(result.current).toHaveProperty('onSubmit');
      expect(result.current).toHaveProperty('handleCancel');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('handleSubmit');
      expect(result.current).toHaveProperty('formState');
      expect(result.current).toHaveProperty('setValue');
      expect(result.current).toHaveProperty('reset');
      expect(result.current).toHaveProperty('watch');
      expect(result.current).toHaveProperty('getValues');
    });

    it('handleCancel debe ser una función operable', () => {
      const { result } = renderHook(() => useResidenteForm());

      expect(() => {
        result.current.handleCancel();
      }).not.toThrow();
    });

    it('onSubmit debe ser una función operable', () => {
      const { result } = renderHook(() => useResidenteForm());

      expect(() => {
        result.current.onSubmit({});
      }).not.toThrow();
    });
  });
});