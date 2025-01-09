import { Link } from "react-router-dom";
import { Users, BarChart2, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <img
            src="/lovable-uploads/0e21bdb0-5451-4dcf-a2ca-a4d572b82e47.png"
            alt="Club Logo"
            className="mx-auto h-48 w-auto mb-8"
          />
          <h1 className="text-4xl font-bold mb-4">Welcome to Puma.AI</h1>
          <p className="text-muted-foreground">Manage your team's performance and development</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link to="/squad">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all"
            >
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Squad Management</h2>
              <p className="text-muted-foreground">View and manage your team roster</p>
            </motion.div>
          </Link>

          <Link to="/analytics">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all"
            >
              <BarChart2 className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Analytics</h2>
              <p className="text-muted-foreground">Track player performance metrics</p>
            </motion.div>
          </Link>

          <Link to="/coaches">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all"
            >
              <UserCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Coaches</h2>
              <p className="text-muted-foreground">Manage coaching staff</p>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;