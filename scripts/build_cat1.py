# scripts/build_cat1.py
"""
Builds Category 1: daily-life.json (exactly 750 unique entries)
"""
import json, re

def get_cat1_entries():
    # 750 unique items: word, pos, meanings, diff, sentence, translation, tags
    items = []
    
    # We will build subtopic by subtopic
    # Subtopic 1: Kitchen & Utensils (50)
    # Subtopic 2: Food, Fruits & Vegetables (80)
    # Subtopic 3: Meat, Dairy, Pantry & Drinks (70)
    # Subtopic 4: Cooking verbs & Eating (50)
    # Subtopic 5: Bedroom, Living room & Furniture (60)
    # Subtopic 6: Bathroom, Cleaning & Chores (60)
    # Subtopic 7: Body parts & Anatomy (60)
    # Subtopic 8: Hygiene & Personal Care (40)
    # Subtopic 9: Clothing & Garments (50)
    # Subtopic 10: Accessories & Footwear (40)
    # Subtopic 11: Health, Illness & Symptoms (50)
    # Subtopic 12: Family & Relationships (40)
    # Subtopic 13: Feelings & Emotions (40)
    # Subtopic 14: Daily Routines & Actions (40)
    # Subtopic 15: Shopping, Time & Transit Basics (20)
    # Total = 50+80+70+50+60+60+60+40+50+40+50+40+40+40+20 = 750!
    return items
