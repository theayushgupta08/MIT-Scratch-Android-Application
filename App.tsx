import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  PanResponder,
  Animated,
  ScrollView,
} from 'react-native';

interface Sprite {
  name: string;
  image: any; // Use 'any' for images; you can refine the type as needed
}

interface Block {
  code: string;
}

const App = () => {
  const [selectedSprite, setSelectedSprite] = useState<Sprite | null>(null);
  const [spriteActions, setSpriteActions] = useState<Record<string, { x: number; y: number }>>({});
  const [blocksInAction, setBlocksInAction] = useState<Record<string, string[]>>({});
  const [isActionScreenVisible, setIsActionScreenVisible] = useState<boolean>(false);
  const [addedStripes, setAddedStripes] = useState<Sprite[]>([]); 
  const [draggingSprite, setDraggingSprite] = useState<{ name: string; x: number; y: number } | null>(null);
  const [spriteTransforms, setSpriteTransforms] = useState<Record<string, { x: number; y: number; rotation: number }>>({
    'Sprite 1': { x: 0, y: 0, rotation: 0 },
    'Sprite 2': { x: 0, y: 0, rotation: 0 },
    'Sprite 3': { x: 0, y: 0, rotation: 0 },
    'Sprite 4': { x: 0, y: 0, rotation: 0 },
    'Sprite 5': { x: 0, y: 0, rotation: 0 },
    'Sprite 6': { x: 0, y: 0, rotation: 0 },
  });



  const stripes: Sprite[] = [
    { name: 'Sprite 1', image: require('./assets/sprite1.png') },
    { name: 'Sprite 2', image: require('./assets/sprite2.png') },
    { name: 'Sprite 3', image: require('./assets/sprite3.png') },
    { name: 'Sprite 4', image: require('./assets/sprite4.png') },
    { name: 'Sprite 5', image: require('./assets/sprite5.png') },
    { name: 'Sprite 6', image: require('./assets/sprite6.png') },
  ];

  const blocks: Block[] = [
    { code: 'Move X by 10' },
    { code: 'Move Y by 10' },
    { code: 'Rotate 180 degrees' },
    { code: 'Goto (0,0)' },
    { code: 'Move X=50, Y=50' },
  ];

  const callHeroFeature = () => {
    // Reset the state
    handleReset();

    // Select Sprite 1 and Sprite 2
    const sprite1 = stripes.find(sprite => sprite.name === 'Sprite 1');
    const sprite2 = stripes.find(sprite => sprite.name === 'Sprite 2');

    if (sprite1 && sprite2) {
      addStripe(sprite1, 50, 200); // Start position for Sprite 1
      addStripe(sprite2, 100, 200); // Start position for Sprite 2
      setSelectedSprite(sprite1);
    }

    // Start animation
    animateSprites();
  };

  const animateSprites = () => {
    const duration = 10000; // 5 seconds
    const steps = 100; // Number of steps in the animation
    const sprite1Name = 'Sprite 1';
    const sprite2Name = 'Sprite 2';

    let step = 0;

    const animationInterval = setInterval(() => {
      step += 1;

      // Move Sprite 1 +10 and Sprite 2 -10
      setSpriteActions(prev => ({
        ...prev,
        [sprite1Name]: { x: (prev[sprite1Name]?.x || 0) + 10 * (1 / steps), y: prev[sprite1Name]?.y || 0 },
        [sprite2Name]: { x: (prev[sprite2Name]?.x || 0) - 10 * (1 / steps), y: prev[sprite2Name]?.y || 0 },
      }));

      // Check for collision (when their positions overlap)
      if (step >= steps) {
        clearInterval(animationInterval);
        // Swap animations
        swapAnimations();
      }
    }, duration / steps);
  };

  const swapAnimations = () => {
    const sprite1Name = 'Sprite 1';
    const sprite2Name = 'Sprite 2';
    let step = 0;

    const duration = 10000; // 5 seconds
    const steps = 100; // Number of steps in the animation

    const animationInterval = setInterval(() => {
      step += 1;

      // Move Sprite 1 -10 and Sprite 2 +10
      setSpriteActions(prev => ({
        ...prev,
        [sprite1Name]: { x: (prev[sprite1Name]?.x || 0) - 10 * (1 / steps), y: prev[sprite1Name]?.y || 0 },
        [sprite2Name]: { x: (prev[sprite2Name]?.x || 0) + 10 * (1 / steps), y: prev[sprite2Name]?.y || 0 },
      }));

      if (step >= steps) {
        clearInterval(animationInterval);
      }
    }, duration / steps);
  };

  const handlePlay = () => {
    if (!selectedSprite) {
      Alert.alert('Select a sprite to play!');
      return;
    }

    const actions = blocksInAction[selectedSprite.name] || [];
    let x = spriteActions[selectedSprite.name]?.x || 0;
    let y = spriteActions[selectedSprite.name]?.y || 0;
    let rotation = spriteTransforms[selectedSprite.name]?.rotation || 0;

    actions.forEach(action => {
      if (action === 'Move X by 10') {
        x += 10;
      } else if (action === 'Move Y by 10') {
        y += 10;
      } else if (action === 'Rotate 180 degrees') {
        rotation += 180;
      } else if (action === 'Goto (0,0)') {
        x = 0;
        y = 0;
      } else if (action === 'Move X=50, Y=50') {
        x += 50;
        y += 50;
      }
    });

    // Update sprite position
    setSpriteActions(prev => ({
      ...prev,
      [selectedSprite.name]: { x, y },
    }));

    setSpriteTransforms(prev => ({
      ...prev,
      [selectedSprite.name]: {
        x: x, 
        y: y, 
        rotation: rotation,
      },
    }));
  };

  

  const handleReset = () => {
    setSpriteActions({});
    setBlocksInAction({});
    setSelectedSprite(null);
    setAddedStripes([]); // Reset added stripes as well
  };

  const handleSpriteSelect = (stripe: Sprite) => {
    setSelectedSprite(stripe);
    setBlocksInAction(prev => ({
      ...prev,
      [stripe.name]: prev[stripe.name] || [],
    }));
    setIsActionScreenVisible(true); // Go to action screen
  };

  const handleDone = () => {
    if (selectedSprite) {
      // Add the selected sprite to added stripes when done
      addStripe(selectedSprite);
    }
    setIsActionScreenVisible(false); // Go back to home screen
  };

  const addBlockToAction = (block: string) => {
    if (!selectedSprite) {
      Alert.alert('Select a sprite to add actions!');
      return;
    }

    setBlocksInAction(prev => ({
      ...prev,
      [selectedSprite.name]: [...(prev[selectedSprite.name] || []), block],
    }));
  };

  const addStripe = (stripe: Sprite, initialX: number, initialY: number) => {
    setSpriteActions(prev => ({
      ...prev,
      [stripe.name]: { x: initialX, y: initialY },
    }));
    setAddedStripes(prev => [...prev, stripe]); // Add selected stripe to added stripes
  };

  // PanResponder to handle dragging
  const createPanResponder = (stripe: Sprite) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDraggingSprite({ name: stripe.name, x: spriteActions[stripe.name]?.x || 0, y: spriteActions[stripe.name]?.y || 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        if (draggingSprite) {
          setSpriteActions(prev => ({
            ...prev,
            [draggingSprite.name]: {
              x: draggingSprite.x + gestureState.dx,
              y: draggingSprite.y + gestureState.dy,
            },
          }));
        }
      },
      onPanResponderRelease: () => {
        setDraggingSprite(null); // Reset dragging sprite on release
      },
    });
  };


  return (
    <View style={styles.container}>
      {isActionScreenVisible ? (
        // Action Screen
        <View style={styles.actionContainer}>
          <View style={styles.actionHeader}>
            <Text style={styles.headerText}>Add Actions for {selectedSprite?.name}</Text>
            <Button title="Done" onPress={handleDone} />
          </View>
          <View style={styles.actionColumns}>
            <View style={styles.column}>
              <Text style={styles.columnHeader}>Code</Text>
              {blocks.map((block, index) => (
                <TouchableOpacity key={index} onPress={() => addBlockToAction(block.code)}>
                  <Text style={styles.block}>{block.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.column}>
              <Text style={styles.columnHeader}>Action</Text>
              {(blocksInAction[selectedSprite?.name] || []).map((action, index) => (
                <Text key={index} style={styles.block}>{action}</Text>
              ))}
            </View>
          </View>
        </View>
      ) : (
        // Home Screen
        <>
          <View style={styles.part1}>
            <Image source={require('./assets/logo.png')} style={{ width: 100, height: 100 }} />
          </View>

          <View style={styles.part2}>
            <Text style={styles.playgroundText}>Playground</Text>
            <View style={styles.playground}>
              {addedStripes.map((stripe, index) => (
                <AnimatedSprite
                  key={index}
                  sprite={stripe}
                  position={spriteActions[stripe.name]}
                  panResponder={createPanResponder(stripe)}
                  rotation={spriteTransforms[stripe.name]?.rotation || 0}
                />
              ))}
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Reset" onPress={handleReset} />
              <View style={styles.buttonSpacing} />
              <Button title="Play" onPress={handlePlay} />
              <View style={styles.buttonSpacing} />
              <Button title="Hero Feature" onPress={callHeroFeature} />
            </View>

          </View>
          <View>

          </View>

          <View style={styles.part3}>
            {selectedSprite && (
              <Text style={{ fontWeight: 'bold', fontSize: 14, color: 'black' }}>
                Selected: {selectedSprite.name} at X: {spriteActions[selectedSprite.name]?.x?.toFixed(2)} Y: {spriteActions[selectedSprite.name]?.y?.toFixed(2)}
              </Text>
            )}
          </View>


          <View style={styles.part4}>
            <Text style={styles.stripesHeader}>Available Stripes</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
              {stripes.map((stripe, index) => (
                <TouchableOpacity key={index} onPress={() => handleSpriteSelect(stripe)}>
                  <View style={styles.stripe}>
                    <Image source={stripe.image} style={styles.stripeImage} />
                    <Text>{stripe.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
};

const AnimatedSprite = ({ sprite, position, panResponder, rotation }) => {
  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.sprite,
        {
          left: position.x,
          top: position.y,
          transform: [{ rotate: `${rotation}deg` }],
        },
      ]}
    >
      <Image source={sprite.image} style={styles.spriteImage} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  part1: {
    flex: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    padding: 20,
    backgroundColor: '#FFA500'
  },
  buttonSpacing: {
    width: 20
  },
  part2: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginRight: 10
  },
  part3: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  part4: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    padding: 20,
  },
  playground: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'black',
    position: 'relative',
    justifyContent: 'center', // Center sprites
    alignItems: 'center', // Center sprites
  },
  sprite: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  spriteImage: {
    width: '100%',
    height: '100%',
  },
  actionContainer: {
    flex: 1,
    padding: 20,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionColumns: {
    flexDirection: 'row',
    flex: 1,
  },
  column: {
    flex: 1,
    padding: 10,
  },
  columnHeader: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  block: {
    backgroundColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    textAlign: 'center',
  },
  stripesHeader: {
    fontWeight: 'bold',
  },
  stripe: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  stripeImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  playgroundText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default App;
