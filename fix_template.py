content = open(r'd:\liuruxian\project\BrandRadarFront\src\components\idc\FieldPool.vue', 'r', encoding='utf-8').read()
old = ':class="`fp-zone-dot--${getFieldZone(field)}`"'
new = ":class=\"'fp-zone-dot--' + getFieldZone(field)\""
content = content.replace(old, new)
open(r'd:\liuruxian\project\BrandRadarFront\src\components\idc\FieldPool.vue', 'w', encoding='utf-8').write(content)
print('done')
