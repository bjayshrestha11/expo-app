import { usePathname } from 'expo-router';
import { Mailbox } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';

import { MessagesList } from '@/components/messages/message-list';
import { MessageSearchInput } from '@/components/messages/message-search-input';
import { Card } from '@/components/ui/card';
import { H3, P } from '@/components/ui/typography';
import { useWindow } from '@/hooks/use-window';

const ChatLayout = () => {
  const [text, setText] = useState('');
  const pathname = usePathname();
  const { isXs } = useWindow();
  if (isXs) {
    return (
      <div className="flex-1 space-y-4 bg-background p-2 xs:p-6">
        <H3 className="pb-5">Messages</H3>
        <Card className="h-[75vh] flex-1 flex-row items-stretch overflow-hidden border-transparent shadow-none base:border-border">
          <View className="h-full w-[4.5rem] border-r border-r-border p-2 sm:w-56">
            <View className="flex-1 gap-4 bg-background">
              <MessageSearchInput setText={setText} className="hidden sm:flex" />
              <MessagesList filterText={text} />
            </View>
          </View>
          {pathname === '/chat' ? (
            <View className="flex-1 items-center justify-center gap-2 bg-background">
              <Mailbox size={50} />
              <P>Select a user to start conversation</P>
            </View>
          ) : (
            <View className="h-full flex-1 bg-background">
              <Stack />
            </View>
          )}
        </Card>
      </div>
    );
  }
  return <Stack />;
};

export default ChatLayout;
