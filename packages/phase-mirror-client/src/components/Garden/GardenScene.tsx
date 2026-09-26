import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

function GardenScene() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <Environment preset="sunset" />
      <OrbitControls enablePan={true} enableZoom={true} />

      {/* Basic Garden representation for UI layout validation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a3622" />
      </mesh>
      
      {/* Abstract plants representing nodes */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[(i % 3) * 2 - 2, 0.5, Math.floor(i / 3) * 2 - 2]}>
          <boxGeometry args={[0.5, 1 + Math.random(), 0.5]} />
          <meshStandardMaterial color={Math.random() > 0.5 ? '#4ade80' : '#22c55e'} />
        </mesh>
      ))}
    </Canvas>
  );
}

export default GardenScene;
