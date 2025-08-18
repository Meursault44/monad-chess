import { usePrivy } from '@privy-io/react-auth';
import { Button } from "@chakra-ui/react"

export const AuthButtons = () =>  {
    const { ready, authenticated, user, login, logout } = usePrivy();
    console.log(user)
    if (!ready) return null;

    return authenticated ? (
        <div className={'flex flex-col gap-2'}>
            <div>Hi, {user?.email?.address ?? user?.wallet?.address}</div>
            <Button onClick={logout}>Logout</Button>
        </div>
    ) : (
            <Button className={'h-[50px] bg-amber-50'} onClick={login}>Login</Button>
    );
}