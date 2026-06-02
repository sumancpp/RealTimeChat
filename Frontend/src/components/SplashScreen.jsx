import { motion } from "framer-motion";

const SplashScreen = () => {

    return (

        <motion.div

            initial={{
                opacity: 1
            }}

            exit={{
                opacity: 0
            }}

            className="
            fixed
            inset-0
            z-[9999]
            bg-white
            flex
            items-center
            justify-center
            "

        >

            <motion.img

                src="/logo.png"

                alt="Logo"

                initial={{
                    scale: 0.8,
                    y: 0
                }}

                animate={{
                    scale: 1,
                    y: -120
                }}

                transition={{
                    duration: 1.2,
                    ease: "easeInOut"
                }}

                className="
                w-32
                h-32
                object-contain
                "

            />

        </motion.div>

    );

};

export default SplashScreen;