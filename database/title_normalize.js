exports.titleNormalize = (title) => 
{
    return title.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[=+()*&^%$#@!_,;?.\s]+/g,"-").replace(/[^-a-zA-Z0-9]/g,'').replace(/(-)\1+/g, '$1').replace(/^-+|-+$/gm,'').toLowerCase();
}