import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const InstallPrompt = () => {

    const [deferredPrompt, setDeferredPrompt] =
        useState(null);

    const [show, setShow] =
        useState(false);

    useEffect(() => {

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

            }, 5000);

        const handler = (e) => {

            console.log(
                "beforeinstallprompt fired"
            );

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

            console.log(
                "Deferred Prompt:",
                deferredPrompt
            );

            if (deferredPrompt) {

                try {

                    await deferredPrompt.prompt();

                    const result =
                        await deferredPrompt.userChoice;

                    console.log(
                        result
                    );

                    if (
                        result.outcome ===
                        "accepted"
                    ) {

                        setShow(false);

                    }

                } catch (error) {

                    console.log(error);

                }

                return;

            }

            const isMobile =
                /Android|iPhone|iPad|iPod/i.test(
                    navigator.userAgent
                );

            if (isMobile) {

                alert(
`Install popup is not available.

Android:

1. Open Chrome
2. Tap ⋮ menu
3. Tap "Add to Home Screen"
or
4. Tap "Install App"`
                );

            } else {

                alert(
`Install popup is not available.

Desktop Chrome:

1. Click ⋮ menu
2. Click "Install BaatCheet"

or

Look for the install icon in the address bar.`
                );

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
                        duration: 0.3
                    }}

                    className="
                    fixed
                    top-4
                    left-1/2
                    -translate-x-1/2
                    z-[9999]
                    glass-panel
                    border
                    border-cyan-500/30
                    text-white
                    px-5
                    py-3
                    rounded-2xl
                    shadow-2xl
                    backdrop-blur-2xl
                    flex
                    items-center
                    gap-4
                    max-w-[95%]
                    "

                >

                    <div>

                        <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                            📱 Install BaatCheet App
                        </h3>

                        <p className="text-xs text-slate-400 font-medium">
                            Get real-time notifications on your device
                        </p>

                    </div>

                    <button

                        onClick={
                            handleInstall
                        }

                        className="
                        glow-button
                        text-white
                        px-4
                        py-2
                        rounded-xl
                        font-bold
                        text-xs
                        cursor-pointer
                        shadow-md
                        "

                    >

                        Install App

                    </button>

                </motion.div>

            )}

        </AnimatePresence>

    );

};

export default InstallPrompt;