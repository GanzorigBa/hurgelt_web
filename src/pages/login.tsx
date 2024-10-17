import { useData } from "@/helper/context";
import firebaseApp from "@/helper/firebase";
import useFcmToken from "@/helper/useFcmToken";
import authApi from "@/lib/authApi";
import axiosInstance, { setAxiosBearerToken } from "@/lib/axios";
import { TokenResponse, useGoogleLogin } from "@react-oauth/google";
import { Button, Card, Form, Input, message } from "antd";
import { setCookie } from "cookies-next";
import { getMessaging, onMessage } from "firebase/messaging";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Login = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loginForm] = Form.useForm<{ id: string; password: string }>();
  const { data: session, update } = useSession();
  const { userContent, changeUserContent } = useData();
  const { fcmToken, notificationPermissionStatus } = useFcmToken();

  useEffect(() => {
    if (notificationPermissionStatus) {
    }
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const messaging = getMessaging(firebaseApp);
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log(
          "Foreground push notification received:",
          messaging,
          payload
        );
      });
      return () => {
        unsubscribe();
      };
    }
  }, []);
  const login = async (val: any) => {
    if (!submitting) {
      setSubmitting(true);
      await axiosInstance.post("/auth/login", {
        username: val?.username,
        password: val?.password,
        device_token: fcmToken,
      }).then(async(res)=>{
        if (res.status === 200 && res?.data?.login) {
          if (!res.data?.data) {
            toast.warn("Хэрэглэгч бүртгэлгүй байна!!!");
            return;
          }
          if (res?.data?.user?.level == 3) {
            toast.error("Жолоочын эрхээр нэвтрэх боломжгүй!!!");
            setSubmitting(false);
            return;
          } else {
            setAxiosBearerToken(res?.data?.data);
            setCookie("accessToken", res?.data?.data, { maxAge: 36000000 });
            await signIn("credentials", {
              redirect: false,
              username: val?.username,
              password: val?.password,
              callbackUrl: `/login`,
            });
  
            update({ user: res?.data?.data });
            localStorage.setItem("token", JSON.stringify(res?.data?.data));
            messageApi.open({
              type: "success",
              content: "Тавтай морил.",
            });
            router.push("/");
          }
        } else {
          setSubmitting(false);
          messageApi.open({
            type: "warning",
            content: "Хэрэглэгчийн нэр эсвэл Нууц үг буруу байна!",
          });
        }
      }).catch((e)=>{
         
      setSubmitting(false);
      });
      
      setSubmitting(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response: TokenResponse) => {
      setSubmitting(true);
      console.log(response);
      if (response.access_token) {
        setCookie("idToken", response.access_token);
      }
      await authApi
        .loginViaGooglecustom(response.access_token, fcmToken)
        .then(async (signing: any) => {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 1);
          sessionStorage.setItem("expiresAt", expiresAt.toString());
          if (!signing.data) {
            toast.warn("Хэрэглэгч бүртгэлгүй байна!!!");
            return;
          }
          await signIn("credentials", {
            redirect: false,
            username: signing.user?.username,
            callbackUrl: `/`,
          });
          update({ user: signing.user });

          localStorage.setItem("token", JSON.stringify(signing.data));
          messageApi.open({
            type: "success",
            content: "Success!",
          });
          setSubmitting(false);
          router.push("/");
        });
    },
    onError: (error) => {
      setSubmitting(false);
      console.log("error:::", error.error_description);
    },
  });

  return (
    <div className="w-full flex justify-center place-items-center h-full bg-no-repeat  bg-white bg-bottom bg-auto    bg-[url('/assets/bg_login23.png')] ">
      {contextHolder}
      <Card
        className="shadow-2xl backdrop-blur-sm bg-white/30 "
        title={
          <div className="w-full flex justify-center">
            <Image
              src="/assets/guru_logo/startlogo.png"
              alt="logo"
              width={150}
              height={150}
            />
          </div>
        }
      >
        <p className="flex justify-center font-bold pb-3">
          {userContent?.username
            ? "Тавтай морилно уу " + userContent?.username
            : ""}
        </p>
        <Form
          onFinish={login}
          className="font-bold"
          labelCol={{ span: 9 }}
          form={loginForm}
        >
          <Form.Item
            label="Нэвтрэх нэр"
            name="username"
            rules={[{ required: true, message: "Нэвтрэх нэрээ бичнэ үү." }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Нууц үг"
            name="password"
            rules={[{ required: true, message: "Нууц үгээ бичнэ үү." }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 9 }}>
            <Button
              type="primary"
              htmlType="submit"
              className="text-white bg-red-700  "
              onSubmit={() => {
                loginForm.submit();
              }}
              loading={submitting}
              onClick={() => {
                loginForm.submit();
              }}
            >
              Нэвтрэх
            </Button>
          </Form.Item>
          <div className="flex justify-center items-center">
            <div
              className="bg-white w-[250px] h-[40px] border rounded-md flex items-center justify-center gap-2"
              onClick={() => googleLogin()}
            >
              <Image src={"/assets/google.png"} alt="" width={40} height={40} />
              <p className="text-[12px] font-bold">Google Login</p>
            </div>
          </div>

          <div className="font-bold flex justify-center mt-5">
            Жолоочын апп татах
          </div>
          <div className="flex justify-center gap-5 mt-1">
            <Link href={"/assets/hurgelt.apk"} target="_blank">
              <Image
                className="cursor-pointer"
                onClick={() => {}}
                src={"/assets/android.png"}
                alt=""
                width={100}
                height={40}
              />
            </Link>
            <Link href="https://app.tulga-shop.com?shop=start" target="_blank">
              <Image
                className="cursor-pointer"
                src={"/assets/iphone.png"}
                alt=""
                width={100}
                height={40}
              />
            </Link>
          </div>
          <div className="text-[10px] ">
            <Link href={"/assets/video.mp4"}>video</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};
Login.hideHeader = true;

export default Login;
