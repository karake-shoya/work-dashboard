import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Work Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">サインインして続ける</p>
        </div>

        {/* Google ログイン */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
          className="w-full"
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <GoogleIcon />
            Google でサインイン
          </button>
        </form>

        {/* 区切り線 */}
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-gray-400">または</span>
          </div>
        </div>

        {/* ゲストログイン */}
        <form
          action={async (formData: FormData) => {
            "use server";
            try {
              await signIn("credentials", {
                password: formData.get("password"),
                redirectTo: "/",
              });
            } catch (e) {
              // NEXT_REDIRECT は正常なリダイレクトなので再スロー
              if (e instanceof AuthError) {
                redirect("/login?error=1");
              }
              throw e;
            }
          }}
          className="w-full space-y-3"
        >
          <input
            type="password"
            name="password"
            placeholder="ゲストパスワード"
            required
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {error && (
            <p className="text-xs text-red-500">パスワードが正しくありません</p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            ゲストとしてログイン
          </button>
        </form>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
