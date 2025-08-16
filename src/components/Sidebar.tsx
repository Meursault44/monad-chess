import { VStack, Link } from "@chakra-ui/react";
import {AuthButtons} from "@/components/AuthButton.tsx";

export const Sidebar = () => {
    return (
        <VStack
            as="nav"
            h="100vh"
            w="240px"
            bg="white"
            color="white"
            justify="space-between"
            align="stretch"
            p={4}
        >
            <VStack align="stretch">
                <Link href="/">Главная</Link>
                <Link href="/about">О нас</Link>
                <Link href="/contact">Контакты</Link>
            </VStack>
            <AuthButtons />
        </VStack>
    );
}