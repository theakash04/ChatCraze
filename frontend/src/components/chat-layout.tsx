import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/user-avatar';
import { LogOut, Loader2, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAxios } from '@/hooks/useAxios';
import { ApiResponse } from '@/types/ApiResponse';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface ChatLayoutProps {
  children: React.ReactNode;
  onSelect: (user: string) => void;
  ws: WebSocket | null;
}
interface User {
  username: string;
  isOnline: boolean; // or boolean, depending on your actual data
}

export function ChatLayout({ children, onSelect, ws }: ChatLayoutProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelecteduser] = useState<string>('');
  const router = useRouter();
  const username = usePathname().split('/').pop();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSideBar, setShowSideBar] = useState<boolean>(false);

  useEffect(() => {
    async function getAllUsers() {
      try {
        const res = await useAxios.get<ApiResponse>('/getUsers');
        if (res.data.success) {
          let temp = Array.isArray(res.data?.data) ? res.data.data : [];
          temp = temp.filter((user) => user.username !== username);
          setUsers(temp);
        }
      } catch (err) {
        router.push('/server-down');
      } finally {
        setIsLoading(false);
      }
    }

    getAllUsers();
  }, []);

  const logoutUser = async () => {
    localStorage.removeItem('accessToken');
    useAxios
      .get('/logout')
      .then((res) => {
        toast({
          title: res.data.message,
        });
        ws?.close();
        router.refresh();
      })
      .catch((err) => {
        toast({
          title: 'Logout failed',
          description: 'some unexpected error occured while logging out',
        });
      });
  };

  function handlesidebar() {
    setShowSideBar((prev) => !prev);
  }

  return (
    <div className="flex h-screen">
      <div className="absolute left-0 sm:hidden block">
        <Button
          className="rounded-full flex items-center justify-center"
          onClick={handlesidebar}
          variant={'ghost'}
          size={'icon'}
        >
          <Menu className="text-white" />
        </Button>
      </div>
      {/* Sidebar */}
      <div
        className={`w-64 border-r bg-background flex flex-col sm:relative bottom-0 top-0 absolute sm:left-0 transition-all ease-linear  ${showSideBar ? 'left-0' : '-left-72'}`}
      >
        <ScrollArea className="flex-1 relative">
          <div className="absolute right-0 sm:hidden block">
            <Button
              className="rounded-full m-2"
              onClick={handlesidebar}
              variant={'ghost'}
              size={'icon'}
            >
              <Menu className="text-white" />
            </Button>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight mb-2">
                Users
              </h2>

              {/* Here paste users that will be obtained from the server */}
              {users.length === 0 || isLoading ? (
                <div className="flex items-center justify-center w-full">
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <p>No user found!</p>
                  )}
                </div>
              ) : (
                users.map((user, index) => (
                  <Button
                    variant={
                      selectedUser === user?.username ? 'secondary' : 'ghost'
                    }
                    className="w-full justify-start"
                    key={index}
                    onClick={() => {
                      onSelect(user?.username);
                      setSelecteduser(user?.username);
                    }}
                  >
                    <UserAvatar
                      user={{ name: user?.username }}
                      className="h-6 w-6 mr-2"
                    />
                    {user?.username}
                  </Button>
                ))
              )}
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-4 space-y-2 flex items-center justify-center flex-col">
          <Button
            variant="ghost"
            className="w-full justify-start font-semibold"
            onClick={() => router.refresh()}
          >
            <UserAvatar
              user={{ name: username as string }}
              className="h-6 w-6"
            />
            {username}
          </Button>
          <Separator />
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive"
            onClick={logoutUser}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
