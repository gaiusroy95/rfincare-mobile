import ForgotPasswordScreen from '@/src/screens/ForgotPasswordScreen';

export default function AgentForgotPasswordRoute() {
  return (
    <ForgotPasswordScreen
      variant="agent"
      loginRoute="/(agent)/login"
    />
  );
}
