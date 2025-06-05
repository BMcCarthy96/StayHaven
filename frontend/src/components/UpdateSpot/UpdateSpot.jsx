import CreateSpot from "../CreateSpot";
import { motion } from "framer-motion";

function UpdateSpot() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <CreateSpot />
        </motion.div>
    );
}

export default UpdateSpot;
