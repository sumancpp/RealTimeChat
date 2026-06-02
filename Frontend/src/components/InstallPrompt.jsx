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

        // ALREADY INSTALLED
        const isInstalled =

            window.matchMedia(
                "(display-mode: standalone)"
            ).matches ||

            window.navigator.standalone;

        if (isInstalled)
            return;

        setShow(true);

        const timer =
            setTimeout(() => {

                setShow(false);

            }, 10000);

        const handler = (e) => {

            e.preventDefault();

            console.log(
                "Install Prompt Ready"
            );

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

            if (!deferredPrompt) {

                alert(
                    "Open browser menu and tap 'Add to Home Screen' or 'Install App'"
                );

                return;

            }

            try {

                deferredPrompt.prompt();

                const result =
                    await deferredPrompt.userChoice;

                console.log(
                    result.outcome
                );

                if (
                    result.outcome ===
                    "accepted"
                ) {

                    setShow(false);

                }

                setDeferredPrompt(
                    null
                );

            } catch (error) {

                console.log(
                    error
                );

            }

        };

    return (

        <AnimatePresence>

            {show && (

                <motion.div

                    initial={{
                        y: -120,
                        opacity: 0
                    }}

                    animate={{
                        y: 0,
                        opacity: 1
                    }}

                    exit={{
                        y: -120,
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
                    w-fit
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

                        disabled={
                            !deferredPrompt
                        }

                        className={`

                            px-4
                            py-2
                            rounded-xl
                            font-semibold
                            transition

                            ${

                                deferredPrompt

                                    ? "bg-white text-orange-500"

                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"

                            }

                        `}

                    >

                        {

                            deferredPrompt

                                ? "Add"

                                : "Preparing..."

                        }

                    </button>

                </motion.div>

            )}

        </AnimatePresence>

    );

};

export default InstallPrompt;