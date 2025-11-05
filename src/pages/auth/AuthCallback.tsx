// src/pages/auth/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/slices/authSlice";
import type { User, Provider } from "../../types/user.types";

/**
 * 소셜 로그인 완료 후 백엔드가 리다이렉트할 콜백 페이지
 * URL 예시:
 * http://localhost:5173/auth/callback?token=eyJhbGci...&memberId=3&email=woo2926%40naver.com&name=%EC%9A%B0%EB%AF%BC%ED%98%81&provider=kakao
 */

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // ✅ 백엔드에서 전달된 쿼리 파라미터 추출
    const token = params.get("token");
    const email = params.get("email");
    const name = params.get("name");
    const provider = params.get("provider") as Provider | null;
    const memberId = params.get("memberId");

    if (token && memberId && email) {
      // ✅ User 타입에 맞게 필요한 필드 채워주기 (기본값 포함)
      const user: User = {
        id: Number(memberId),
        name: name || "",
        loginId: "", // 소셜 로그인은 loginId가 없으므로 빈 문자열
        email: email || "",
        password: "", // 비밀번호 없음
        nickname: name || "", // 닉네임은 이름으로 초기화
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        provider: (provider || "LOCAL") as Provider,
      };

      // ✅ Redux 상태 업데이트 및 토큰 저장
      dispatch(loginSuccess({ accessToken: token, user }));

      // ✅ 메인 페이지로 이동
      navigate("/calendar");
    } else {
      console.error("⚠️ 필수 토큰 또는 사용자 정보 누락");
      navigate("/login");
    }
  }, [params, dispatch, navigate]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.2rem",
        fontWeight: "500",
      }}
    >
      로그인 처리 중입니다...
    </div>
  );
}
