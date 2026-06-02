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

            try {

                if (deferredPrompt) {

                    deferredPrompt.prompt();

                    const choice =
                        await deferredPrompt.userChoice;

                    if (
                        choice.outcome ===
                        "accepted"
                    ) {

                        setShow(false);

                    }

                    return;

                }

                const isMobile =

                    /Android|iPhone|iPad|iPod/i
                        .test(
                            navigator.userAgent
                        );

                if (isMobile) {

                    alert(

`Android:

1. Open Chrome Menu (⋮)

2. Tap "Add to Home Screen"

or

3. Tap "Install App"`

                    );

                }

                else {

                    alert(

`Desktop Chrome:

1. Open Chrome Menu (⋮)

2. Click "Install BaatCheet"

or

Look for the Install icon in the address bar.`

                    );

                }

            }

            catch (error) {

                console.log(error);

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
                    top-2
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

                            Add BaatCheet to your device

                        </p>

                    </div>

                    <button

                        onClick={
                            handleInstall
                        }

                        className="
                        bg-white
                        text-orange-500
                        px-2
                        py-1
                        rounded-xl
                        font-semibold
                        cursor-pointer
                        hover:bg-orange-100
                        transition
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