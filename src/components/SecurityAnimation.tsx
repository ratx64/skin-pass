import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';

const GRID_SIZE = 20;
const MATRIX_CHARS = '01'.split('');
const NUM_PARTICLES = 1000;

interface MatrixCharProps {
  position: [number, number, number];
  char: string;
  delay: number;
}

const MatrixChar = ({ position, char, delay }: MatrixCharProps) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ref.current && ref.current.material instanceof THREE.Material) {
      const time = clock.getElapsedTime() - delay;
      if (time > 0) {
        ref.current.position.y = position[1] - (time % 3) * 2;
        ref.current.material.opacity = Math.max(0, 1 - (time % 3) / 1.5);
      }
    }
  });

  return (
    <Text
      ref={ref}
      position={position}
      fontSize={0.2}
      color="#00f7ff"
      anchorX="center"
      anchorY="middle"
      material-transparent={true}
      material-opacity={0.7}
    >
      {char}
    </Text>
  );
};

const FloatingPassword = () => {
  const ref = useRef<THREE.Group>(null);
  const chars = "********".split('');
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
      ref.current.position.y = Math.sin(clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {chars.map((char, i) => (
        <Text
          key={i}
          position={[i * 0.3 - (chars.length * 0.3) / 2, 0, 0]}
          fontSize={0.3}
          color="#00f7ff"
          anchorX="center"
          anchorY="middle"
        >
          {char}
        </Text>
      ))}
    </group>
  );
};

const EncryptionParticles = () => {
  const ref = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const temp = new Float32Array(NUM_PARTICLES * 3);
    for (let i = 0; i < temp.length; i += 3) {
      temp[i] = (Math.random() - 0.5) * 8;      // x - reduced spread
      temp[i + 1] = (Math.random() - 0.5) * 8;  // y - reduced spread
      temp[i + 2] = (Math.random() - 0.5) * 8;  // z - reduced spread
    }
    return temp;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime() * 0.05; // Slowed down time
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Gentler spiral motion
        positions[i] = x * Math.cos(time) - z * Math.sin(time) * 0.5;
        positions[i + 2] = z * Math.cos(time) + x * Math.sin(time) * 0.5;
        positions[i + 1] = y + Math.sin(time * 0.5 + x * 0.05) * 0.02;
      }
      
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03} // Reduced particle size
        color="#00f7ff"
        transparent
        opacity={0.4} // Reduced opacity
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const MatrixBackground = () => {
  const chars = useMemo(() => {
    const temp = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (Math.random() > 0.85) {
          temp.push({
            position: [
              (i - GRID_SIZE / 2) * 0.5,
              (j - GRID_SIZE / 2) * 0.5,
              -5
            ] as [number, number, number],
            char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
            delay: Math.random() * 2
          });
        }
      }
    }
    return temp;
  }, []);

  return (
    <>
      {chars.map((props, i) => (
        <MatrixChar key={i} {...props} />
      ))}
    </>
  );
};

const SecurityScene = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.z = 5;
  }, [camera]);

  return (
    <>
      <MatrixBackground />
      <EncryptionParticles />
      <FloatingPassword />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
    </>
  );
};

const SecurityAnimation = () => {
  return (
    <div className="w-full h-[400px] bg-[#000814] rounded-lg overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
        <SecurityScene />
      </Canvas>
    </div>
  );
};

export default SecurityAnimation; 
