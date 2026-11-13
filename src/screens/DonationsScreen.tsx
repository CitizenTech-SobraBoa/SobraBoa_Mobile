import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import { donationService } from '../services/backend';
import { usePaged } from '../hooks/usePaged';
import { Button, Empty, Heading, Loading, Notice, Screen } from '../components/ui';
import { DonationCard } from '../components/DonationCard';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../auth/AuthContext';
export function DonationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const { session } = useAuth();
  const list = usePaged(donationService.mine);
  return (
    <Screen>
      <Heading
        title="Minhas doações"
        subtitle="Acompanhe cada alimento que ganha um novo destino."
      />
      <Button
        title="Nova doação"
        disabled={session?.aprovacao !== 'APROVADO'}
        onPress={() => navigation.navigate('Create')}
      />
      <Notice error message={list.error} />
      <Button secondary title="Atualizar lista" busy={list.busy} onPress={() => void list.load()} />
      {list.busy && <Loading />}
      {!list.busy && !list.error && list.data?.content.length === 0 && (
        <Empty
          title="Sua primeira boa ação"
          detail="Cadastre uma doação para começar. Ela será salva como rascunho para você revisar."
        />
      )}
      {list.data?.content.map((d) => (
        <DonationCard
          key={d.id}
          donation={d}
          onPress={() => navigation.navigate('Details', { id: d.id, owned: true })}
        />
      ))}
      {list.data && (
        <Pagination
          page={list.data.page.number}
          totalPages={list.data.page.totalPages}
          busy={list.busy}
          onPage={(n) => void list.load(n)}
        />
      )}
    </Screen>
  );
}
