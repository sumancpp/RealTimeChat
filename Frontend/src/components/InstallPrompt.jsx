import { useEffect, useState } from "react";

const InstallPrompt = () => {

    const [
        deferredPrompt,
        setDeferredPrompt
    ] = useState(null);

    const [
        showInstall,
        setShowInstall
    ] = useState(false);

    useEffect(() => {

        const handler = (e) => {

            e.preventDefault();

            setDeferredPrompt(e);

            setShowInstall(true);

        };

        window.addEventListener(
            "beforeinstallprompt",
            handler
        );

        return () => {

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

            await deferredPrompt.userChoice;

            setShowInstall(false);

        };

    if (!showInstall)
        return null;

    return (

        <div
            className="
            fixed
            bottom-5
            left-1/2
            -translate-x-1/2
            bg-orange-500
            text-white
            px-4
            py-3
            rounded-xl
            shadow-lg
            z-50
            flex
            items-center
            gap-3
            "
        >

            <span>
                Add BaatCheet to Home Screen
            </span>

            <button

                onClick={
                    handleInstall
                }

                className="
                bg-white
                text-orange-500
                px-4
                py-1
                rounded-lg
                font-semibold
                "
            >

                Add

            </button>

        </div>

    );

};

export default InstallPrompt;