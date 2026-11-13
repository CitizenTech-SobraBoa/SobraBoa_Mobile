import { Body, Button, Card, Choices, Field } from './ui';
import type { Category, ItemRequest, Unit } from '../types/api';
import { dateOnly, localDateTime, numeric, required } from '../validation/forms';
export interface ItemDraft {
  key: string;
  category: string;
  description: string;
  quantity: string;
  unit: Unit;
  weight: string;
  expiry: string;
  prepared: string;
}
export const newItem = (): ItemDraft => ({
  key: `${Date.now()}-${Math.random()}`,
  category: '',
  description: '',
  quantity: '',
  unit: 'UN',
  weight: '',
  expiry: '',
  prepared: '',
});
export function itemPayload(item: ItemDraft): ItemRequest {
  return {
    categoriaId: numeric(item.category, 'Categoria', 1, 32767),
    descricao: required(item.description, 'descrição do item'),
    quantidade: numeric(item.quantity, 'Quantidade', 0.001),
    unidade: item.unit,
    pesoEstimadoKg: item.weight ? numeric(item.weight, 'Peso estimado', 0) : null,
    dataValidade: dateOnly(item.expiry),
    preparadoEm: item.prepared ? localDateTime(item.prepared) : null,
  };
}
export function ItemEditor({
  item,
  index,
  categories,
  onChange,
  onRemove,
}: {
  item: ItemDraft;
  index: number;
  categories: Category[];
  onChange: (item: ItemDraft) => void;
  onRemove?: () => void;
}) {
  const change = (key: keyof ItemDraft, value: string) => onChange({ ...item, [key]: value });
  const category = categories.find((c) => String(c.id) === item.category);
  return (
    <Card>
      <Body>Alimento {index + 1}</Body>
      <Choices
        label="Categoria *"
        value={item.category}
        options={categories.map((c) => ({ value: String(c.id), label: c.nome }))}
        onChange={(t) => change('category', t)}
      />
      {category?.observacaoCuidado && <Body>{category.observacaoCuidado}</Body>}
      {category?.requerRefrigeracaoPadrao && (
        <Body>Esta categoria costuma exigir refrigeração. Revise as condições da doação.</Body>
      )}
      <Field
        label="Descrição do alimento *"
        maxLength={200}
        value={item.description}
        onChangeText={(t) => change('description', t)}
      />
      <Field
        label="Quantidade *"
        keyboardType="decimal-pad"
        value={item.quantity}
        onChangeText={(t) => change('quantity', t)}
      />
      <Choices<Unit>
        label="Unidade *"
        value={item.unit}
        onChange={(t) => change('unit', t)}
        options={[
          { value: 'UN', label: 'Unidade' },
          { value: 'KG', label: 'Kg' },
          { value: 'PORCAO', label: 'Porção' },
          { value: 'CAIXA', label: 'Caixa' },
          { value: 'LITRO', label: 'Litro' },
        ]}
      />
      <Field
        label="Peso estimado total (kg)"
        keyboardType="decimal-pad"
        value={item.weight}
        onChangeText={(t) => change('weight', t)}
      />
      <Field
        label="Validade (DD/MM/AAAA)"
        value={item.expiry}
        maxLength={10}
        placeholder="DD/MM/AAAA"
        onChangeText={(t) => change('expiry', t)}
      />
      <Field
        label="Preparado em (DD/MM/AAAA HH:mm)"
        value={item.prepared}
        maxLength={16}
        placeholder="DD/MM/AAAA HH:mm"
        onChangeText={(t) => change('prepared', t)}
      />
      {onRemove && <Button secondary title="Remover este alimento" onPress={onRemove} />}
    </Card>
  );
}
