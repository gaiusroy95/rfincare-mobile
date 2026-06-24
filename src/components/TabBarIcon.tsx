import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type TabIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

/** Returns a tabBarIcon renderer using Ionicons (active + outline variants). */
export function tabBarIcon(active: IoniconName, inactive?: IoniconName) {
  return ({ color, size, focused }: TabIconProps) => (
    <Ionicons name={focused ? active : (inactive ?? active)} size={size} color={color} />
  );
}
