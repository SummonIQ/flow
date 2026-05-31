'use client';

import { SummonIQIcon } from '@/components/studio/icons/app-lab-icon';
import { useBuilderStore } from '@/lib/studio/store';
import { Button } from '@summoniq/applab-ui';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface WelcomePageProps {
  onCreateProject: (name: string, description?: string) => void;
}

export function WelcomePage({ onCreateProject }: WelcomePageProps) {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const { getStarredProjects, recentProjects, loadProject, toggleStarProject } =
    useBuilderStore();
  const starredProjects = getStarredProjects();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      onCreateProject(projectName, projectDescription || undefined);
    }
  };

  const handleProjectClick = async (projectId: string) => {
    const project = recentProjects.find(p => p.id === projectId);
    if (project) {
      // TODO: Load project from file system
      // For now, just show a message
      alert(`Loading project: ${project.name}`);
    }
  };

  return (
    <div className="min-h-full w-full flex flex-col justify-center p-8 relative overflow-hidden">
      {/* Animated 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blue Blob */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"
          animate={{
            scale: [1, 1.4, 0.9, 1.2, 1],
            x: [0, 100, -50, 80, 0],
            y: [0, 60, -40, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Pink Blob */}
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl"
          animate={{
            scale: [1, 1.5, 0.8, 1.3, 1],
            x: [0, -120, 60, -80, 0],
            y: [0, -70, 40, -50, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />
        {/* Purple Blob */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 0.9, 1.2, 1],
            x: [0, -60, 70, -40, 0],
            y: [0, 50, -60, 40, 0],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 8,
          }}
        />
      </div>

      {/* Starred Projects Cards */}
      {starredProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-full max-w-6xl mx-auto mb-8 relative z-10"
        >
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Starred Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starredProjects.map((project: any, index: number) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
                onClick={() => handleProjectClick(project.id)}
                className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02] hover:border-primary/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex-1"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {project.name}
                    </h3>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      {project.type}
                    </span>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleStarProject(project.id);
                    }}
                    className="text-yellow-500 hover:text-yellow-400 transition-colors p-1 -mr-1 -mt-1"
                    aria-label="Unstar project"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  </button>
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">
                  Last opened:{' '}
                  {new Date(project.lastOpened).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Create Project Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-auto relative z-10"
      >
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-6"
            >
              <SummonIQIcon />
            </motion.div>
            <h1 className="text-3xl font-bold mb-3 tracking-tight">
              Welcome to SummonIQ
            </h1>
            <p className="text-muted-foreground">
              Let's create your first project
            </p>
          </div>

          {/* Create Project Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base placeholder:text-muted-foreground/50"
                required
                autoFocus
              />
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Description{' '}
                <span className="text-muted-foreground text-xs font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                value={projectDescription}
                onChange={e => setProjectDescription(e.target.value)}
                placeholder="What are you building?"
                className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all text-base placeholder:text-muted-foreground/50"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <motion.div
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  className="w-full py-3.5 bg-zinc-900 dark:bg-zinc-800 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.25)] hover:bg-zinc-800 dark:hover:bg-zinc-700 text-base border border-zinc-800 dark:border-zinc-700"
                  disabled={!projectName.trim()}
                  size="lg"
                >
                  Create Project
                </Button>
              </motion.div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
