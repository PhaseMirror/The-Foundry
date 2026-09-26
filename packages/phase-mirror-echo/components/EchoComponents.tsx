
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Environment, Torus } from '@react-three/drei';
import * as THREE from 'three';

const BraidParticle = ({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      // Significantly slower motion
      ref.current.position.y = position[1] + Math.sin(t * 0.4 + position[0]) * 0.1;
      ref.current.rotation.x = t * 0.05;
    }
  });

  return (
    <Sphere ref={ref} args={[1, 64, 64]} position={position} scale={scale}>
      <MeshDistortMaterial
        color={color}
        envMapIntensity={0.2}
        clearcoat={0.1}
        metalness={0.0}
        roughness={1.0}
        distort={0.1}
        speed={0.2}
      />
    </Sphere>
  );
};

export const BraidVisualization: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.5} />
        
        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.1}>
          <BraidParticle position={[0, 0, 0]} color="#7FA99B" scale={1.2} />
        </Float>
        
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export const SoftLoopMockup: React.FC = () => {
  const [phase, setPhase] = useState<'inhale' | 'exhale' | 'hold'>('inhale');
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
        if (timer % 12 === 0) setPhase('exhale');
        else if (timer % 6 === 0) setPhase('inhale');
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  return (
    <div className="flex flex-col items-center justify-center p-20 bg-brand-light rounded-[4rem] border border-stone-100 min-h-[500px]">
      <div className="relative mb-20">
        <div className={`w-32 h-32 rounded-full border border-brand-accent/10 transition-all duration-8000 flex items-center justify-center ${phase === 'inhale' ? 'scale-110' : 'scale-95'}`}>
          <div className="text-xl font-serif text-stone-400">{timer}</div>
        </div>
      </div>
      
      <div className="text-center mb-16">
        <h3 className="font-serif text-xl text-stone-600 mb-2 uppercase tracking-[0.3em]">{phase}</h3>
      </div>

      <div className="flex gap-8">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="px-10 py-3 bg-brand-dark text-white rounded-2xl font-bold transition-all text-xs uppercase tracking-widest"
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
};
