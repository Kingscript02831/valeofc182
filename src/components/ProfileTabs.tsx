import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "./ThemeProvider";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MediaCarousel } from "./MediaCarousel";
import Tags from "./Tags";
import { useToast } from "@/hooks/use-toast";

interface ProductWithDistance {
  id: string;
  title: string;
  price: number;
  images?: string[];
  distance?: number;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes: number;
  created_at: string;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  post_likes: { reaction_type: string; user_id: string; }[];
  post_comments: { id: string; }[];
}

interface ProfileTabsProps {
  userProducts: ProductWithDistance[] | undefined;
  userPosts: Post[] | undefined;
  isLoading?: boolean;
}

const ProfileTabs = ({ userProducts, userPosts, isLoading }: ProfileTabsProps) => {
  const { theme } = useTheme();
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoje às ${format(date, 'HH:mm')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${format(date, 'HH:mm')}`;
    } else {
      return format(date, "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await navigator.share({
        url: `${window.location.origin}/posts/${postId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
      toast({
        title: "Link copiado",
        description: "O link foi copiado para sua área de transferência",
      });
    }
  };

  const handleWhatsAppShare = async (postId: string) => {
    const postUrl = `${window.location.origin}/posts/${postId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(postUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start border-b border-gray-800 bg-transparent">
        <TabsTrigger
          value="posts"
          className={`flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Posts
        </TabsTrigger>
        <TabsTrigger
          value="products"
          className={`flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Produtos
        </TabsTrigger>
        <TabsTrigger
          value="reels"
          className={`flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Reels
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="min-h-[200px]">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-none shadow-sm animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      <div className="h-3 w-16 bg-gray-200 rounded mt-2" />
                    </div>
                  </div>
                  <div className="h-24 bg-gray-200 rounded mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userPosts && userPosts.length > 0 ? (
          <div className="space-y-4 p-4">
            {userPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden bg-white dark:bg-card border-none shadow-sm">
                <CardContent className="p-0">
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        className="h-10 w-10 border-2 border-primary/10 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {post.user.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold">{post.user.full_name}</h2>
                          <p className="text-sm text-muted-foreground">@{post.user.username}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(post.created_at)}
                        </p>
                      </div>
                    </div>

                    {post.content && (
                      <p className="text-foreground text-[15px] leading-normal">
                        <Tags content={post.content} />
                      </p>
                    )}
                  </div>

                  {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                    <div className="relative w-full">
                      <MediaCarousel
                        images={post.images || []}
                        videoUrls={post.video_urls || []}
                        title={post.content || ""}
                        autoplay={false}
                        showControls={true}
                        cropMode="contain"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2 mt-2 border-t border-border/40">
                    <Link
                      to={`/posts/${post.id}`}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <img src="/curtidas.png" alt="Curtir" className="w-5 h-5" />
                      <span className="text-sm text-muted-foreground">
                        {post.post_likes?.length || 0}
                      </span>
                    </Link>

                    <Link
                      to={`/posts/${post.id}`}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <img src="/comentario.png" alt="Comentários" className="w-5 h-5" />
                      <span className="text-sm text-muted-foreground">
                        {post.post_comments?.length || 0}
                      </span>
                    </Link>

                    <button
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleWhatsAppShare(post.id)}
                    >
                      <img src="/whatsapp.png" alt="WhatsApp" className="w-5 h-5" />
                    </button>

                    <button
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleShare(post.id)}
                    >
                      <img src="/compartilharlink.png" alt="Compartilhar" className="w-5 h-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-gray-500">Ainda não há Posts</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="products" className="min-h-[200px]">
        {userProducts && userProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            {userProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id}>
                <Card className={`${theme === 'light' ? 'bg-white' : 'bg-black'} shadow-none border-0 transition-all duration-300 hover:scale-105`}>
                  <CardContent className="p-3">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full aspect-square object-cover rounded-lg mb-2"
                      />
                    )}
                    <h3 className={`font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>{product.title}</h3>
                    <p className="text-green-500">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(Number(product.price))}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-gray-500">Ainda não há Produtos</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="reels" className="min-h-[200px]">
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-gray-500">Ainda não há Reels</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
