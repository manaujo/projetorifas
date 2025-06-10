import React from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Button } from "./ui/Button";

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError: () => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError
}) => {
  const handleSuccess = (response: CredentialResponse) => {
    if (response.credential) {
      onSuccess(response.credential);
    } else {
      onError();
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => onError()}
      useOneTap
      theme="outline"
      shape="rectangular"
      text="continue_with"
      locale="pt-BR"
    />
  );
};
