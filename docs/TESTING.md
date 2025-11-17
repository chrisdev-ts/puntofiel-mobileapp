# Testing: Cómo escribir tests unitarios

Probamos la **lógica de negocio pura** (Use Cases en `src/core/usecases/`) usando **Jest** con **mocks** de repositorios.

---

## 🚀 Comandos

```bash
pnpm test              # Ejecutar todos los tests
pnpm test:watch        # Modo watch (re-ejecuta al guardar)
pnpm test:coverage     # Reporte de cobertura
```

---

## 📁 Estructura

Los tests viven **junto al archivo que prueban** con extensión `.test.ts`:

```
src/core/usecases/
├── auth/
│   ├── loginUser.ts
│   └── loginUser.test.ts          ← Test unitario
├── employee/
│   ├── CreateEmployeeUseCase.ts
│   └── CreateEmployeeUseCase.test.ts
└── reward/
    ├── CreateRewardUseCase.ts
    └── CreateRewardUseCase.test.ts
```

---

## 📝 Patrón de test (AAA)

```typescript
import { CreateRewardUseCase } from './CreateRewardUseCase';
import type { IRewardRepository } from '@/src/core/repositories/IRewardRepository';

describe('CreateRewardUseCase', () => {
  let useCase: CreateRewardUseCase;
  let mockRepository: jest.Mocked<IRewardRepository>;

  beforeEach(() => {
    // 1. Mock del repositorio
    mockRepository = {
      createReward: jest.fn(),
      getRewardById: jest.fn(),
      // ... otros métodos
    };

    // 2. Instanciar Use Case con el mock
    useCase = new CreateRewardUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Casos de éxito', () => {
    it('debe crear una recompensa con datos válidos', async () => {
      // ARRANGE: Preparar datos
      const input = { name: 'Café', points: 50, businessId: 'biz-123' };
      const mockReward = { id: 'reward-1', ...input };
      mockRepository.createReward.mockResolvedValue(mockReward);

      // ACT: Ejecutar
      const result = await useCase.execute(input);

      // ASSERT: Verificar
      expect(result).toEqual(mockReward);
      expect(mockRepository.createReward).toHaveBeenCalledWith(input);
    });
  });

  describe('Validaciones', () => {
    it('debe rechazar puntos negativos', async () => {
      await expect(
        useCase.execute({ name: 'Test', points: -10, businessId: 'biz-123' })
      ).rejects.toThrow('Los puntos deben ser mayores a 0');
    });

    it('debe rechazar nombre vacío', async () => {
      await expect(
        useCase.execute({ name: '', points: 50, businessId: 'biz-123' })
      ).rejects.toThrow('El nombre es obligatorio');
    });
  });

  describe('Errores del repositorio', () => {
    it('debe propagar errores del repositorio', async () => {
      mockRepository.createReward.mockRejectedValue(new Error('DB error'));

      await expect(
        useCase.execute({ name: 'Test', points: 50, businessId: 'biz-123' })
      ).rejects.toThrow('DB error');
    });
  });
});
```

---

## ✅ Reglas

1. **Nombres descriptivos**: `it('debe crear recompensa con datos válidos')` ✅ NO `it('test 1')` ❌
2. **AAA**: Arrange → Act → Assert (separar visualmente con comentarios)
3. **Mock completo**: Mockea TODOS los métodos de la interfaz del repositorio
4. **Probar comportamiento**: No pruebes implementaciones privadas, prueba el API público
5. **Agrupar lógicamente**: Usa `describe` para agrupar (éxito, validaciones, errores)
6. **Limpiar mocks**: Siempre usa `afterEach(() => jest.clearAllMocks())`

---

## 📊 Cobertura

```bash
pnpm test:coverage
```

Genera:
- Reporte en terminal (tabla con % de cobertura)
- Reporte HTML en `coverage/lcov-report/index.html`

**Meta**: 100% de cobertura en los Use Cases que implementes.
