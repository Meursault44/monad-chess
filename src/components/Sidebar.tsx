import { VStack } from "@chakra-ui/react";
import { Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";

import {AuthButtons} from "@/components/AuthButton.tsx";

export const Sidebar = () => {
    return (
        <VStack
            h="100vh"
            w="240px"
            bg="white"
            justify="space-between"
            align="stretch"
            p={4}
        >
            <VStack align="stretch">
                <ChakraLink as={RouterLink} to="/">Homepage</ChakraLink>
                <ChakraLink as={RouterLink} to="/puzzles">Puzzles</ChakraLink>
            </VStack>
            <AuthButtons />
        </VStack>
    );
}