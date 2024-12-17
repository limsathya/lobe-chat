import { Suspense, lazy } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SkeletonList } from '@/features/Conversation';

const Client = lazy(() => import('./Client'));

interface ChatListProps {
  mobile?: boolean;
}

const ChatList = ({ mobile }: ChatListProps) => (
  <Flexbox
    flex={1}
    style={{
      overflowX: 'hidden',
      overflowY: 'auto',
      position: 'relative',
    }}
    width={'100%'}
  >
    <Suspense fallback={<SkeletonList mobile={mobile} />}>
      <Client mobile={mobile} />
    </Suspense>
  </Flexbox>
);

export default ChatList;
