import {
    useEffect,
    useState
} from "react";

import {
    motion,
    AnimatePresence
} from "framer-motion";

const InstallPrompt = () => {

    const [
        deferredPrompt,
        setDeferredPrompt
    ] = useState(null);

    const [
        show,
        setShow
    ] = useState(false);

    useEffect(() => {

        // APP ALREADY INSTALLED
        const isInstalled =

            window.matchMedia(
                "(display-mode: standalone)"
            ).matches ||

            window.navigator.standalone;

        if (isInstalled)
            return;

        // SHOW BANNER
        setShow(true);

        // HIDE AFTER 10 SECONDS
        const timer =
            setTimeout(() => {

                setShow(false);

            }, 10000);

        const handler = (e) => {

            e.preventDefault();

            setDeferredPrompt(e);

        };

        window.addEventListener(
            "beforeinstallprompt",
            handler
        );

        return () => {

            clearTimeout(timer);

            window.removeEventListener(
                "beforeinstallprompt",
                handler
            );

        };

    }, []);

    const handleInstall =
        async () => {

            if (!deferredPrompt)
                return;

            deferredPrompt.prompt();

            const choice =
                await deferredPrompt.userChoice;

            if (
                choice.outcome ===
                "accepted"
            ) {

                setShow(false);

            }

        };

    return (

        <AnimatePresence>

            {show && (

                <motion.div

                    initial={{
                        y: -100,
                        opacity: 0
                    }}

                    animate={{
                        y: 0,
                        opacity: 1
                    }}

                    exit={{
                        y: -100,
                        opacity: 0
                    }}

                    transition={{
                        duration: 0.4
                    }}

                    className="
                    fixed
                    top-4
                    left-1/2
                    -translate-x-1/2
                    z-[9999]
                    bg-orange-500
                    text-white
                    px-5
                    py-3
                    rounded-2xl
                    shadow-xl
                    flex
                    items-center
                    gap-4
                    max-w-[95%]
                    "

                >

                    <div>

                        <h3
                            className="
                            font-semibold
                            "
                        >

                            📱 Install BaatCheet

                        </h3>

                        <p
                            className="
                            text-xs
                            "
                        >

                            Add to home screen for faster access

                        </p>

                    </div>

                    <button

                        onClick={
                            handleInstall
                        }

                        className="
                        bg-white
                        text-orange-500
                        px-4
                        py-2
                        rounded-xl
                        font-semibold
                        cursor-pointer
                        "

                    >

                        Add

                    </button>

                </motion.div>

            )}

        </AnimatePresence>

    );

};

export default InstallPrompt;