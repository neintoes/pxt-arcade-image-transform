/**
 * Extension for scaling and rotating. Inspired by @ChaseMor
 * https://github.com/ChaseMor/pxt-arcade-rotsprite
 */
//% weight=0 color=#b8860b icon="\uf021" block="Sprite Transforms"
//% advanced=true
namespace transformSprites {
    // Number of times the scaled image has been doubled.
    // Scaled image is used for sampling when rotating image.
    const NUM_SCALES: number = 1;

    // Container of state information for rotated sprites
    let _spritesWithRotations: Array<SpriteWithRotation> = [];

    /**
     * Class representing a sprite with rotation.
     */
    class SpriteWithRotation {
        private _spriteId: number;
        private _currRotation: number;
        private _origImage: Image;
        private _scaledImage: Image;
        private _animation: SpriteWithRotationAnimation = null;

        /**
         * Initialize a sprite with rotation state.
         * @param {Sprite} sprite - The sprite to rotate.
         * @param {number} angle - Initial angle of rotation in degrees.
         */
        constructor(sprite: Sprite, angle: number = 0) {
            this._spriteId = sprite.id;
            this._currRotation = angle;
            this._origImage = sprite.image.clone();
            this._scaledImage = scale2x(sprite.image);
        }   // constructor()

        /**
         * Returns the sprite ID.
         * @return {number} The ID of the sprite.
         */
        get id(): number {
            return this._spriteId;
        }   // get id()

        /**
         * Returns the original image associated with the sprite.
         * @return {Image} Sprite's original image.
         */
        get image(): Image {
            return this._origImage;
        }   // get image()

        /**
         * Returns the current angle of rotation for the sprite.
         * @return {number} Angle of rotation in degrees.
         */
        get rotation(): number {
            return this._currRotation;
        }   // get rotation()

        /**
         * Sets the current angle of rotation for the sprite.
         * @param {number} angle - New angle of rotation in degrees.
         */
        set rotation(angle: number) {
            this._currRotation = angle;
        }   // set rotation()

        /**
         * Returns the scaled image for the sprite.
         * @return {Image} The scaled image.
         */
        get scaledImage(): Image {
            return this._scaledImage;
        }   // get scaledImage()

        /**
         * Changes the scaled image associated with the sprite.
         * @param {Image} - New image associated with the sprite.
         */
        set scaledImage(image: Image) {
            this._scaledImage = scale2x(image);
        }

        /**
         * Returns the original image associated with the sprite.
         * @return {Image} - An image representing that attached to the sprite.
         */
        get origImage(): Image {
            return this._origImage;
        }

        /**
         * Changes the original image associated with the sprite.
         * @param {Image} - New image associated with the sprite.
         */
        set origImage(image: Image) {
            this._origImage = image;
        }

        /**
         * Returns the SpriteWithRotationAnimation object on the sprite.
         * @return {SpriteWithRotationAnimation} - Object controlling animation running on the sprite.
         */
        get animation(): SpriteWithRotationAnimation {
            return this._animation;
        }

        /**
         * Changes the original image associated with the sprite.
         * @param {Image} - New image associated with the sprite.
         */
        set animation(spriteWithRotationAnimation: SpriteWithRotationAnimation) {
            let returnImage: Image;
            if (this._animation != null) {
                this._animation.endAnimation = true;
                returnImage = this._animation.returnImage;
            } else {
                returnImage = this._origImage;
            }
            this._animation = spriteWithRotationAnimation;
            this._animation.returnImage = returnImage; 
        }
    }   // class SpriteWithRotation

    /**
     * class SpriteWithRotationAnimator
     */
    class SpriteWithRotationAnimation extends animation.SpriteAnimation {
        private lastFrame: number;
        private _returnImage: Image = null;
        private currentFrame: Image = null;
        public endAnimation: boolean = false;

        constructor(sprite: Sprite, private frames: Image[], private frameInterval: number, loop?: boolean) {
            super(sprite, loop);
            this.lastFrame = -1;
        }

        /**
         * Returns the sprite's image before animation took place.
         * @return {Image} - The selected sprite's image before rotation.
         */
        get returnImage(): Image {
            return this._returnImage;
        }

        /**
         * Sets the image on SpriteWithRotationAnimation to return to once the animation is complete.
         * @return {Image} - Image to return to once animation is complete.
         */
        set returnImage(image: Image) {
            this._returnImage = image;
        }

        public update(): boolean {
            if (this.endAnimation) {
                return true;
            }
            this.elapsedTime += game.eventContext().deltaTimeMillis;
            const frameIndex = Math.floor(this.elapsedTime / this.frameInterval);
            if (this.lastFrame != frameIndex && this.frames.length) {
                if (!this.loop && frameIndex >= this.frames.length) {
                    changeImage(this.sprite, this.returnImage);
                    return true;
                }
                const newImage = this.frames[frameIndex % this.frames.length];
                if (this.currentFrame !== newImage) {
                    this.currentFrame = newImage;
                    changeImage(this.sprite, newImage);
                }
            }
            this.lastFrame = frameIndex;
            return false;
        }
    }




    /**
     * Immutable class representing Cartesian coordinates.
     */
    class Coordinate {
        private _x: number;
        private _y: number;

        /**
         * Create a point.
         * @param {number} x - The x-coordinate of the point.
         * @param {number} y - The y-coordinate of the point.
         */
        constructor(x: number, y: number) {
            this._x = x;
            this._y = y;
        }   // constructor()

        /**
         * Returns the x-coordinate of the point.
         * @return {number} The x-coordinate.
         */
        public get x() {
            return this._x;
        }   // get x()

        /**
         * Returns the y-coordinate of the point.
         * @return {number} The y-coordinate.
         */
        public get y() {
            return this._y;
        }   // get y()
    }   // class Coordinate


    /**
     * Immutable class representing vectors.
     */
    class Vector {
        private _mag: number;
        private _dir: number;

        /**
         * Creates a vector.
         * @param {number} magnitude - Magnitude (length) of the vector.
         * @param {number} direction - Angle of direction of the vector.
         */
        constructor(magnitude: number, direction: number) {
            this._mag = magnitude;
            this._dir = direction;
        }   // constructor()

        /**
         * Returns the angle of direction of the vector.
         * @return {number} The vector's direction.
         */
        public get direction() {
            return this._dir;
        }   // get direction()

        /**
         * Returns the magnitude (length) of the vector.
         * @return {number} The vector's magnitude.
         */
        public get magnitude() {
            return this._mag;
        }   // get magnitude()
    }   // class Vector


    /**
     * Increment the rotation of a sprite.
     * The sprite's image will be updated with the new rotation.
     * Angle is in degrees.
     * Positive change rotates clockwise; negative change rotates counterclockwise.
     */
    //% blockId=transform_change_rotation
    //% block="change rotation of %sprite(mySprite) by %angleChange degrees"
    //% sprite.shadow="variables_get" angleChange.defl=0
    export function changeRotation(sprite: Sprite, angleChange: number): void {
        if (!_spritesWithRotations[sprite.id]) {
            _spritesWithRotations[sprite.id] = new SpriteWithRotation(sprite, 0);
        }   // if ( ! _spritesWithRotations[sprite.id] )

        rotateSprite(sprite, _spritesWithRotations[sprite.id].rotation + angleChange);
    }   // changeRotation()

    /**
     * Get the current rotation angle for a sprite in degrees.
     */
    //% blockId=transform_get_rotation
    //% block="%sprite(mySprite) rotation"
    //% sprite.shadow="variables_get"
    export function getRotation(sprite: Sprite): number {
        if (!_spritesWithRotations[sprite.id]) {
            return 0;
        } else {
            return _spritesWithRotations[sprite.id].rotation;
        }   // if ( ! SpriteWithRotations[sprite.id])
    }   // getRotation()

    /**
     * Rotate a sprite to a specific angle.
     * The sprite's image will be updated to the rotated image.
     * Angle is in degrees.
     * Positive change rotates clockwise; negative change rotates counterclockwise.
     */
    //% blockId=transform_rotate_sprite
    //% block="set rotation of %sprite(mySprite) to %angle degrees"
    //% sprite.shadow="variables_get" angle.defl=0
    export function rotateSprite(sprite: Sprite, angle: number): void {
        if (!_spritesWithRotations[sprite.id]) {
            _spritesWithRotations[sprite.id] = new SpriteWithRotation(sprite, 0);
        }   // if ( ! _spritesWithRotations[sprite.id] )

        _spritesWithRotations[sprite.id].rotation = angle;
        sprite.setImage(rotate(_spritesWithRotations[sprite.id], angle));
    }   // rotateSprite()

    /**
     * Change the current image transformSprites associates with the sprite.
     */
    //% blockId=transform_change_image
    //% block="set image of %sprite(mySprite) to %image=screen_image_picker"
    //% sprite.shadow=variables_get
    export function changeImage(sprite: Sprite, image: Image): void {
        let thisSprite = _spritesWithRotations[sprite.id];
        if (thisSprite) {
            thisSprite.origImage = image;
            thisSprite.scaledImage = image;
            rotateSprite(sprite, thisSprite.rotation);
        }
    }

    /**
     * Run an animation on the selected sprite with rotation. 
     */
    //% blockId= transform_run_image_animation
    //% block="animate %sprite(mySprite) %frames interval (ms) %frameInterval(500) loop %loop"
        //% sprite.defl=mySprite
    //% sprite.shadow=variables_get
    //% frames.shadow=animation_editor
    //% frameInterval.shadow=timePicker
    //% weight=100
    //% blockGap=8
    export function runImageAnimation(sprite: Sprite, frames: Image[], frameinterval: number, loop?: boolean): void {
        if (!_spritesWithRotations[sprite.id]) {
            _spritesWithRotations[sprite.id] = new SpriteWithRotation(sprite, 0);
        } 
        _spritesWithRotations[sprite.id].animation = new SpriteWithRotationAnimation(sprite, frames, frameinterval, loop);
        _spritesWithRotations[sprite.id].animation.init();
    }

    /**
     * Stop one type or all animations (simple and looping) on a sprite
     * @param type the animation type to stop
     * @param sprite the sprite to filter animations by
     */
    //% blockId=stop_animations
    //% block="stop %type animations on %sprite=variables_get(mySprite)"
    //% group="Animate"
    //% weight=60
    //% help=animation/stop-animation
    // export function stopAnimation(type: AnimationTypes, sprite: Sprite) {
    //     let state: AnimationState = game.currentScene().data[stateNamespace];
    //     if (state && state.animations) {
    //         state.animations = state.animations.filter((anim: SpriteAnimation) => {
    //             if (anim.sprite === sprite) {
    //                 switch (type) {
    //                     case AnimationTypes.ImageAnimation:
    //                         if (anim instanceof ImageAnimation) return false;
    //                         break;
    //                     case AnimationTypes.MovementAnimation:
    //                         if (anim instanceof MovementAnimation) return false;
    //                         break;
    //                     case AnimationTypes.All:
    //                         return false;
    //                 }
    //             }
    //             return true;
    //         });
    //     }
    //     if (type == AnimationTypes.All || type == AnimationTypes.ImageAnimation) {
    //         //stop state based animation if any as well
    //         sprite._action = -1
    //     }
    // }

    /**
     * Rotate a sprite to a specific angle.
     * @param {SpriteWithRotation} sprite - Sprite with rotation state.
     * @param {number} angle - Number of degrees to rotate sprite.
     *   Positive values rotate clockwise; negative values rotate counterclockwise.
     * @return {Image} Sprite's rotated image.
     */
    function rotate(sprite: SpriteWithRotation, angle: number): Image {
        // Normalize angle.
        angle %= 360;
        if (angle < 0) {
            angle += 360;
        }   // if (angle < 0)

        // Reflections not needing actual rotation.
        let toReturn: Image = null;
        let x: number = 0;
        let y: number = 0;
        switch (angle) {
            case 0:
                return sprite.image.clone();
            case 90:
                toReturn = image.create(sprite.image.height, sprite.image.width);
                for (x = 0; x < toReturn.width; x++) {
                    for (y = 0; y < toReturn.height; y++) {
                        toReturn.setPixel(x, y,
                            sprite.image.getPixel(y, sprite.image.width - x));
                    }   // for ( y )
                }   // for ( x )
                return toReturn;
            case 180:
                toReturn = image.create(sprite.image.height, sprite.image.width);
                for (x = 0; x < toReturn.width; x++) {
                    for (y = 0; y < toReturn.height; y++) {
                        toReturn.setPixel(x, y,
                            sprite.image.getPixel(sprite.image.width - x, sprite.image.height - y));
                    }   // for ( y )
                }   // for ( x )
                return toReturn;
            case 270:
                toReturn = image.create(sprite.image.height, sprite.image.width);
                for (x = 0; x < toReturn.width; x++) {
                    for (y = 0; y < toReturn.height; y++) {
                        toReturn.setPixel(x, y,
                            sprite.image.getPixel(sprite.image.height - y, x));
                    }   // for ( y )
                }   // for ( x )
                return toReturn;
        }   // switch (angle)


        toReturn = image.create(sprite.image.width, sprite.image.height);
        const rads: number = Math.PI * angle / 180;
        let center: Coordinate = new Coordinate(toReturn.width >> 1, toReturn.height >> 1);

        for (x = 0; x < toReturn.width; x++) {
            for (y = 0; y < toReturn.height; y++) {
                let currVector: Vector = new Vector(
                    Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2),
                    Math.atan2(y - center.y, x - center.x)
                );

                let rotVector: Vector = new Vector(
                    currVector.magnitude,
                    currVector.direction - rads
                );

                let scaledCoord: Coordinate = new Coordinate(
                    Math.round((center.x << NUM_SCALES) + (rotVector.magnitude << NUM_SCALES) * Math.cos(rotVector.direction)),
                    Math.round((center.y << NUM_SCALES) + (rotVector.magnitude << NUM_SCALES) * Math.sin(rotVector.direction))
                );

                if (scaledCoord.x >= 0 && scaledCoord.x < sprite.scaledImage.width &&
                    scaledCoord.y >= 0 && scaledCoord.y < sprite.scaledImage.height) {
                    toReturn.setPixel(x, y, sprite.scaledImage.getPixel(scaledCoord.x, scaledCoord.y));
                }   // scaledCoord within scaledImage bounds
            }   // for ( y )
        }   // for ( x )
        return toReturn;
    }   // rotateImage()


    /**
     * Smoothly doubles the size of an image.
     */
    // Implementation of Scale2X variation of Eric's Pixel Expansion (EPX) algorithm.
    //% blockId=transform_scale2x
    //% block="double size of|image %original=screen_image_picker"
    export function scale2x(original: Image): Image {
        // Double the size of the original.
        let toReturn: Image = image.create(original.width << 1, original.height << 1);

        for (let x: number = 0; x < original.width; x++) {
            for (let y: number = 0; y < original.height; y++) {
                // From original image:
                // .a.
                // cpb
                // .d.
                const p: color = original.getPixel(x, y);
                const a: color = original.getPixel(x, y - 1);
                const b: color = original.getPixel(x + 1, y);
                const c: color = original.getPixel(x - 1, y);
                const d: color = original.getPixel(x, y + 1);

                // In scaled image:
                // 12
                // 34
                let one: Coordinate = new Coordinate(x << 1, y << 1);
                let two: Coordinate = new Coordinate(one.x + 1, one.y);
                let three: Coordinate = new Coordinate(one.x, one.y + 1);
                let four: Coordinate = new Coordinate(one.x + 1, one.y + 1);

                // 1=P; 2=P; 3=P; 4=P;
                // IF C== A AND C!= D AND A!= B => 1 = A
                // IF A== B AND A!= C AND B!= D => 2 = B
                // IF D== C AND D!= B AND C!= A => 3 = C
                // IF B== D AND B!= A AND D!= C => 4 = D
                toReturn.setPixel(one.x, one.y, p);
                toReturn.setPixel(two.x, two.y, p);
                toReturn.setPixel(three.x, three.y, p);
                toReturn.setPixel(four.x, four.y, p);

                if (c == a && c != d && a != b) {
                    toReturn.setPixel(one.x, one.y, a);
                }   // if ( c == a ...
                if (a == b && a != c && b != d) {
                    toReturn.setPixel(two.x, two.y, b);
                }   // if ( a == b ...
                if (d == c && d != b && c != a) {
                    toReturn.setPixel(three.x, three.y, c);
                }   // if ( d == c ...
                if (b == d && b != a && d != c) {
                    toReturn.setPixel(four.x, four.y, d);
                }   // if ( b == d ...
            }   // for ( y )
        }   // for ( x )
        return toReturn;
    }   // scale2x()

    /**
     * Implementation of Scale3X derivation of EPX algorithm.
     * Smoothly triples the size of an image.
     * @param {Image} original - Image to scale.
     * @return {Image} - Image with size tripled.
     */
    export function scale3x(original: Image): Image {
        let toReturn: Image = image.create(original.width * 3, original.height * 3);

        for (let x: number = 0; x < original.width; x++) {
            for (let y: number = 0; y < original.height; y++) {
                // From original image:
                // abc
                // def
                // ghi
                const e: color = original.getPixel(x, y);
                const a: color = original.getPixel(x - 1, y - 1);
                const b: color = original.getPixel(x, y - 1);
                const c: color = original.getPixel(x + 1, y - 1);
                const d: color = original.getPixel(x - 1, y);
                const f: color = original.getPixel(x + 1, y);
                const g: color = original.getPixel(x - 1, y + 1);
                const h: color = original.getPixel(x, y + 1);
                const i: color = original.getPixel(x + 1, y + 1);

                // In scaled image:
                // 123
                // 456
                // 789
                let one: Coordinate = new Coordinate(x * 3, y * 3);
                let two: Coordinate = new Coordinate(one.x + 1, one.y);
                let three: Coordinate = new Coordinate(one.x + 2, one.y);
                let four: Coordinate = new Coordinate(one.x, one.y + 1);
                let five: Coordinate = new Coordinate(one.x + 1, one.y + 1);
                let six: Coordinate = new Coordinate(one.x + 2, one.y + 1);
                let seven: Coordinate = new Coordinate(one.x, one.y + 2);
                let eight: Coordinate = new Coordinate(one.x + 1, one.y + 2);
                let nine: Coordinate = new Coordinate(one.x + 2, one.y + 2);

                // 1=E; 2=E; 3=E; 4=E; 5=E; 6=E; 7=E; 8=E; 9=E;
                for (let newX: number = x * 3; newX < (x + 1) * 3; x++) {
                    for (let newY: number = y * 3; newY < (y + 1) * 3; y++) {
                        toReturn.setPixel(newX, newY, e);
                    }   // for ( newY )
                }   // for ( newX )
                // IF D== B AND D!= H AND B!= F => 1 = D
                // IF(D == B AND D!= H AND B!= F AND E!= C) OR (B == F AND B!= D AND F!= H AND E!= A) => 2 = B
                // IF B== F AND B!= D AND F!= H => 3 = F
                // IF(H == D AND H!= F AND D!= B AND E!= A) OR (D == B AND D!= H AND B!= F AND E!= G) => 4 = D
                // 5 = E
                // IF(B == F AND B!= D AND F!= H AND E!= I) OR (F == H AND F!= B AND H!= D AND E!= C) => 6 = F
                // IF H== D AND H!= F AND D!= B => 7 = D
                // IF(F == H AND F!= B AND H!= D AND E!= G) OR (H == D AND H!= F AND D!= B AND E!= I) => 8 = H
                // IF F== H AND F!= B AND H!= D => 9 = F
                if (d == b && d != h && b != f) {
                    toReturn.setPixel(one.x, one.y, d);
                }   // if ( d == b...
                if ((d == b && d != h && b != f && e != c) || (b != f && b != d && f != h && e != a)) {
                    toReturn.setPixel(two.x, two.y, b);
                }   // if ( (d == b...
                if (b == f && b != d && f != h) {
                    toReturn.setPixel(three.x, three.y, f);
                }   // if ( b == f...
                if ((h == d && h != f && d != b && e != a) || (d == b && d != h && b != f && e != g)) {
                    toReturn.setPixel(four.x, four.y, d);
                    toReturn.setPixel(five.x, five.y, e);
                }   // if ( (h == d...
                if ((b == f && b != d && f != h && e != i) || (f == h && f != b && h != d && e != c)) {
                    toReturn.setPixel(six.x, six.y, f);
                }   // if ( (b == f...
                if (h == d && h != f && d != b) {
                    toReturn.setPixel(seven.x, seven.y, d);
                }   // if ( h == d...
                if ((f == h && f != b && h != d && e != g) || (h == d && h != f && d != b && e != i)) {
                    toReturn.setPixel(eight.x, eight.y, h);
                }   // if ( (f == h...
                if (f == h && f != b && h != d) {
                    toReturn.setPixel(nine.x, nine.y, f);
                }   // if ( f == h...
            }   // for ( y )
        }   // for ( x )
        return toReturn;
    }   // scale3x()
}   // namespace transformSprites

//TODO - Debug running of first animation
//TODO - Ensure SpriteWithRotationAnimation stops running when replaced by a new animation
//TODO - Ensure we're correctly comparing frames in animation despite their rotations.
